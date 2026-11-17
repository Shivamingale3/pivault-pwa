import { z } from "zod";
import { KEY_CHECK_AAD, KEY_CHECK_TEXT } from "@/constants/auth.constants";
import { type EncryptedEnvelope, encryptedEnvelopeSchema } from "@/schemas/crypto.schema";
import { markRecoveryKeyConfigured } from "@/services/auth.service";
import { decryptJson, encryptJson } from "@/services/crypto.service";
import { getUnlockedKey } from "@/services/secure-memory.service";
import { loadSession, markKeyCheckStored } from "@/services/session.service";
import { postSigned } from "@/services/signed-api.client";

const checkSchema = z.object({ check: z.literal(KEY_CHECK_TEXT) });
const responseSchema = z.object({ keyCheck: encryptedEnvelopeSchema.nullable() });

/**
 * The recovery-key check: a fixed text encrypted with the vault key. The server stores it without
 * being able to read it; a new device must decrypt it before a typed recovery key is accepted,
 * even when the vault is still empty.
 */
export const makeKeyCheck = (key: CryptoKey): Promise<EncryptedEnvelope> =>
  encryptJson(key, { check: KEY_CHECK_TEXT }, KEY_CHECK_AAD);

/** The check the server holds for this account, or null when it has none yet. */
export async function fetchKeyCheck(signal?: AbortSignal): Promise<EncryptedEnvelope | null> {
  const { keyCheck } = await postSigned("/auth/recovery-key-check", {}, responseSchema, { signal });
  return keyCheck;
}

/** True when this key opens the check, i.e. it is the account's vault key. */
export const opensKeyCheck = (key: CryptoKey, check: EncryptedEnvelope): Promise<boolean> =>
  decryptJson(key, check, checkSchema, KEY_CHECK_AAD).then(
    () => true,
    () => false,
  );

/** A new recovery key replaced the old one: the server now checks typed keys against this one. */
export async function replaceKeyCheck(
  check: EncryptedEnvelope,
  signal?: AbortSignal,
): Promise<void> {
  await postSigned("/auth/recovery-key-check/replace", { keyCheck: check }, z.undefined(), {
    signal,
  });
}

/**
 * Accounts set up before the check existed have none on the server. Once unlocked (so the key is
 * known to be the working one), store it, once. Best effort: a failure is retried on the next unlock.
 */
export async function ensureKeyCheckStored(): Promise<void> {
  const session = await loadSession();
  if (!session || session.keyCheckStored) return;
  if ((await fetchKeyCheck()) === null) {
    await markRecoveryKeyConfigured(await makeKeyCheck(getUnlockedKey()));
  }
  await markKeyCheckStored();
}
