import { idbDelete, idbGet, idbPut } from "@/db/idb";
import { CRYPTO_ERROR_MESSAGES } from "@/constants/crypto.constants";
import { RecordId, STORAGE_ERROR_MESSAGES, StoreName } from "@/constants/storage.constants";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import { StorageErrorKind } from "@/enums/storage.enum";
import { CryptoError } from "@/services/crypto.error";
import { StorageError } from "@/services/storage.error";

/** Duck-typed on purpose: `instanceof CryptoKey` breaks across realms (iframes, test envs). */
const asKey = (value: unknown): CryptoKey | null =>
  typeof value === "object" &&
  value !== null &&
  "type" in value &&
  "extractable" in value &&
  "algorithm" in value &&
  "usages" in value
    ? (value as CryptoKey)
    : null;

const algorithmName = (key: CryptoKey): string => key.algorithm.name;

const isVaultKey = (key: CryptoKey | null): key is CryptoKey =>
  key !== null &&
  key.type === "secret" &&
  !key.extractable &&
  algorithmName(key) === "AES-GCM" &&
  key.usages.includes("encrypt") &&
  key.usages.includes("decrypt");

const isLoginPair = (value: unknown): value is CryptoKeyPair => {
  if (typeof value !== "object" || value === null) return false;
  const priv = asKey((value as Partial<CryptoKeyPair>).privateKey);
  const pub = asKey((value as Partial<CryptoKeyPair>).publicKey);
  return (
    priv !== null &&
    pub !== null &&
    priv.type === "private" &&
    !priv.extractable &&
    algorithmName(priv) === "ECDSA" &&
    pub.type === "public"
  );
};

/** Never persist a key whose bytes could be read back, and never fall back to raw key storage. */
const assertSafeToStore = (ok: boolean) => {
  if (!ok) throw new CryptoError(CryptoErrorKind.Failed, CRYPTO_ERROR_MESSAGES.failed);
};

/** Reads a record; a record that fails `valid` is deleted and reported as corrupted. */
async function loadChecked<T>(
  id: string,
  valid: (value: unknown) => value is T,
): Promise<T | null> {
  const value = await idbGet(StoreName.Keys, id);
  if (value === undefined) return null;
  if (valid(value)) return value;
  await idbDelete(StoreName.Keys, id).catch(() => undefined);
  throw new StorageError(StorageErrorKind.Corrupted, STORAGE_ERROR_MESSAGES.corrupted);
}

const isVaultKeyValue = (value: unknown): value is CryptoKey => isVaultKey(asKey(value));

/** The persisted AES-256-GCM vault key, or null when this device has none (ask for the recovery key). */
export const loadVaultKey = () => loadChecked(RecordId.VaultKey, isVaultKeyValue);

export async function saveVaultKey(key: CryptoKey): Promise<void> {
  assertSafeToStore(isVaultKey(asKey(key)));
  await idbPut(StoreName.Keys, RecordId.VaultKey, key);
}

export const clearVaultKey = () => idbDelete(StoreName.Keys, RecordId.VaultKey);

/**
 * A new recovery key's CryptoKey while it replaces the vault key. Kept until the vault is
 * re-encrypted and on the server, so a crash halfway can carry on instead of losing anything.
 */
export const loadPendingVaultKey = () => loadChecked(RecordId.PendingVaultKey, isVaultKeyValue);

export async function savePendingVaultKey(key: CryptoKey): Promise<void> {
  assertSafeToStore(isVaultKey(asKey(key)));
  await idbPut(StoreName.Keys, RecordId.PendingVaultKey, key);
}

export const clearPendingVaultKey = () => idbDelete(StoreName.Keys, RecordId.PendingVaultKey);

export const loadLoginKeyPair = () => loadChecked(RecordId.LoginKeyPair, isLoginPair);

export async function saveLoginKeyPair(pair: CryptoKeyPair): Promise<void> {
  assertSafeToStore(isLoginPair(pair));
  await idbPut(StoreName.Keys, RecordId.LoginKeyPair, pair);
}

export const clearLoginKeyPair = () => idbDelete(StoreName.Keys, RecordId.LoginKeyPair);
