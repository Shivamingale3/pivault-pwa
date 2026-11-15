export const StorageErrorKind = {
  /** IndexedDB doesn't exist or is blocked (private mode, policy). */
  Unavailable: "unavailable",
  /** A stored record is missing parts or has the wrong shape. */
  Corrupted: "corrupted",
  Failed: "failed",
} as const;

export type StorageErrorKind = (typeof StorageErrorKind)[keyof typeof StorageErrorKind];
