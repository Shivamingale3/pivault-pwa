/** Identifies this replication so RxDB resumes from its checkpoint after a reload. */
export const REPLICATION_ID = "pivault-vault-sync-v1";

/** Server limits (backend vault.constants.ts): at most 100 per pull and 10 per push. */
export const PULL_BATCH_SIZE = 50;
export const PUSH_BATCH_SIZE = 5;

/** Largest entry (its JSON as UTF-8) the app will encrypt: the server accepts about 67 KB per blob. */
export const MAX_PAYLOAD_BYTES = 60_000;

/** Periodic check for changes from other devices while the app is open and unlocked. */
export const SYNC_INTERVAL_MS = 30_000;
/** "Sync now" gives up waiting after this long (it keeps syncing in the background). */
export const SYNC_NOW_TIMEOUT_MS = 20_000;

/** How long RxDB waits before retrying after a failed request. */
export const SYNC_RETRY_MS = 5_000;

/** How many entries a new device pulls to check a typed recovery key against the real vault. */
export const KEY_CHECK_SAMPLE = 5;

export const SYNC_MESSAGES = {
  ended: "You signed in on another device, so this phone no longer syncs.",
  keyMismatch: "That key doesn't match your vault.",
  tooLarge: "This item is too large to sync. Shorten it and try again.",
} as const;
