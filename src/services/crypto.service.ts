import type { z } from "zod";
import {
  AES_IV_BYTES,
  CRYPTO_ERROR_MESSAGES,
  ENVELOPE_ALGORITHM,
  ENVELOPE_VERSION,
  LOGIN_KEY_ALGORITHM,
  RECOVERY_KEY_BYTES,
} from "@/constants/crypto.constants";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import { type EncryptedEnvelope, encryptedEnvelopeSchema } from "@/schemas/crypto.schema";
import { CryptoError } from "@/services/crypto.error";
import {
  base64ToBytes,
  bytesToBase64,
  bytesToBase64Url,
  bytesToHex,
  hexToBytes,
} from "@/utils/bytes.utils";
import { parseRecoveryKey } from "@/utils/recovery-key.utils";

const additionalData = (aad?: string) =>
  aad === undefined ? {} : { additionalData: new TextEncoder().encode(aad) };

const subtle = (): SubtleCrypto => {
  // `crypto.subtle` only exists in secure contexts (HTTPS / localhost).
  if (typeof globalThis.crypto === "undefined" || !("subtle" in globalThis.crypto)) {
    throw new CryptoError(CryptoErrorKind.Unsupported, CRYPTO_ERROR_MESSAGES.unsupported);
  }
  return globalThis.crypto.subtle;
};

/** 64 lowercase hex characters from 32 secure random bytes. Show it once; never store or send it. */
export const generateRecoveryKey = (): string => {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(RECOVERY_KEY_BYTES));
  const hex = bytesToHex(bytes);
  bytes.fill(0);
  return hex;
};

/**
 * Turns a recovery key (any formatting) into the vault's AES-256-GCM key. The key is
 * non-extractable: it can be used but its bytes can never be read back. The raw bytes are
 * wiped right after import. No hashing or stretching: the recovery key is already high-entropy.
 */
export async function importRecoveryKey(input: string): Promise<CryptoKey> {
  const raw = hexToBytes(parseRecoveryKey(input));
  try {
    return await subtle().importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  } catch (error) {
    if (error instanceof CryptoError) throw error;
    throw new CryptoError(CryptoErrorKind.Failed, CRYPTO_ERROR_MESSAGES.failed, error);
  } finally {
    raw.fill(0);
  }
}

/** Device login key pair. The private key is non-extractable; the public key can be exported. */
export async function generateLoginKeyPair(): Promise<CryptoKeyPair> {
  try {
    return await subtle().generateKey(LOGIN_KEY_ALGORITHM, false, ["sign", "verify"]);
  } catch (error) {
    if (error instanceof CryptoError) throw error;
    throw new CryptoError(CryptoErrorKind.Failed, CRYPTO_ERROR_MESSAGES.failed, error);
  }
}

/** Public key as base64url SPKI, the form the server requires on login. */
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  try {
    return bytesToBase64Url(new Uint8Array(await subtle().exportKey("spki", publicKey)));
  } catch (error) {
    throw new CryptoError(CryptoErrorKind.Failed, CRYPTO_ERROR_MESSAGES.failed, error);
  }
}

/**
 * JSON -> UTF-8 -> AES-256-GCM with a fresh random IV, packed in a versioned envelope.
 * `aad` (optional) is authenticated but not encrypted: decrypting only works with the same value,
 * which binds a blob to the record it belongs to so a server can't swap blobs between records.
 */
export async function encryptJson(
  key: CryptoKey,
  value: unknown,
  aad?: string,
): Promise<EncryptedEnvelope> {
  try {
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(AES_IV_BYTES));
    const plaintext = new TextEncoder().encode(JSON.stringify(value));
    const ciphertext = await subtle().encrypt(
      { name: "AES-GCM", iv, ...additionalData(aad) },
      key,
      plaintext,
    );
    plaintext.fill(0);
    return {
      version: ENVELOPE_VERSION,
      algorithm: ENVELOPE_ALGORITHM,
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    };
  } catch (error) {
    if (error instanceof CryptoError) throw error;
    throw new CryptoError(CryptoErrorKind.Failed, CRYPTO_ERROR_MESSAGES.failed, error);
  }
}

/**
 * Reverses `encryptJson` and checks the result against `schema`. Wrong key, tampered or
 * malformed data all fail the same way (`DecryptFailed`) and reveal nothing else.
 */
export async function decryptJson<S extends z.ZodType>(
  key: CryptoKey,
  envelope: unknown,
  schema: S,
  aad?: string,
): Promise<z.output<S>> {
  const fail = (cause?: unknown) =>
    new CryptoError(CryptoErrorKind.DecryptFailed, CRYPTO_ERROR_MESSAGES.decryptFailed, cause);
  const parsed = encryptedEnvelopeSchema.safeParse(envelope);
  if (!parsed.success) throw fail();
  try {
    const plaintext = await subtle().decrypt(
      { name: "AES-GCM", iv: base64ToBytes(parsed.data.iv), ...additionalData(aad) },
      key,
      base64ToBytes(parsed.data.ciphertext),
    );
    const value = schema.safeParse(JSON.parse(new TextDecoder().decode(plaintext)));
    if (!value.success) throw fail();
    return value.data;
  } catch (error) {
    throw error instanceof CryptoError ? error : fail(error);
  }
}
