export const CryptoErrorKind = {
  /** No Web Crypto in this browser/context. */
  Unsupported: "unsupported",
  InvalidRecoveryKey: "invalid-recovery-key",
  /** Wrong key or tampered data. Deliberately says nothing more. */
  DecryptFailed: "decrypt-failed",
  /** A key was needed but the app is locked. */
  Locked: "locked",
  Failed: "failed",
} as const;

export type CryptoErrorKind = (typeof CryptoErrorKind)[keyof typeof CryptoErrorKind];
