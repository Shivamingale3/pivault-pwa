import { CRYPTO_ERROR_MESSAGES } from "@/constants/crypto.constants";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import { CryptoError } from "@/services/crypto.error";

/** The unlocked vault key lives only here: module memory, never storage, gone on reload or lock. */
let unlockedKey: CryptoKey | null = null;

export const setUnlockedKey = (key: CryptoKey): void => {
  unlockedKey = key;
};

export const isUnlocked = (): boolean => unlockedKey !== null;

/** The key for vault reads/writes. Throws `Locked` when the app is locked. */
export function getUnlockedKey(): CryptoKey {
  if (!unlockedKey) throw new CryptoError(CryptoErrorKind.Locked, CRYPTO_ERROR_MESSAGES.locked);
  return unlockedKey;
}

/** Call on lock and on sign out. */
export const clearUnlockedKey = (): void => {
  unlockedKey = null;
};
