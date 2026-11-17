/** One small IndexedDB for auth material. `CryptoKey`s must live here (structured clone). */
export const AUTH_DB_NAME = "pivault-auth";
export const AUTH_DB_VERSION = 1;

export const StoreName = {
  Keys: "keys",
  Auth: "auth",
} as const;
export type StoreName = (typeof StoreName)[keyof typeof StoreName];

/** Record ids inside the stores. */
export const RecordId = {
  LoginKeyPair: "login-key-pair",
  VaultKey: "vault-key",
  Session: "session",
  AppLock: "app-lock",
  SyncStats: "sync-stats",
  Usage: "usage",
  Preferences: "preferences",
} as const;

export const STORAGE_ERROR_MESSAGES = {
  unavailable: "Secure storage isn't available in this browser.",
  corrupted: "Saved data on this device is unreadable.",
  failed: "Couldn't save to secure storage. Try again.",
} as const;
