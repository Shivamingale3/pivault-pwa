export const PIN_LENGTH = 6;
export const PIN_PATTERN = /^\d{6}$/;

/** OWASP 2023 minimum for PBKDF2-HMAC-SHA256. */
export const PBKDF2_ITERATIONS = 600_000;
export const PIN_SALT_BYTES = 16;
export const PIN_HASH_BITS = 256;

/** After every 5th wrong PIN the app locks out: 30 seconds, then 5 minutes, then 1 hour (and stays at 1 hour). */
export const PIN_ATTEMPTS_PER_TIER = 5;
export const LOCKOUT_WAITS_MS = [30_000, 5 * 60_000, 60 * 60_000] as const;

export const APP_LOCK_MESSAGES = {
  invalidPin: "Enter a 6 digit PIN.",
} as const;
