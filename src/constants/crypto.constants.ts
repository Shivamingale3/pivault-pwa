/** 256-bit recovery key = 32 random bytes = 64 hex characters. */
export const RECOVERY_KEY_BYTES = 32;
export const RECOVERY_KEY_HEX_LENGTH = RECOVERY_KEY_BYTES * 2;
/** Displayed as 8 groups of 8 hex characters, separated by hyphens. */
export const RECOVERY_KEY_GROUP_SIZE = 8;

/** AES-GCM with a fresh 96-bit IV per encryption (never reused with the same key). */
export const AES_IV_BYTES = 12;
export const AES_KEY_LENGTH = 256;

export const ENVELOPE_VERSION = 1;
export const ENVELOPE_ALGORITHM = "AES-GCM-256";

/** Device login key pair: private key is non-extractable, public key is sent on login. */
export const LOGIN_KEY_ALGORITHM = { name: "ECDSA", namedCurve: "P-256" } as const;

export const CRYPTO_ERROR_MESSAGES = {
  unsupported: "This browser can't protect your data. Use an up-to-date browser over HTTPS.",
  invalidRecoveryKey: "That recovery key isn't valid. Check it and try again.",
  decryptFailed: "Your data couldn't be unlocked. Check your recovery key and try again.",
  locked: "PiVault is locked.",
  failed: "Something went wrong while securing your data. Try again.",
} as const;
