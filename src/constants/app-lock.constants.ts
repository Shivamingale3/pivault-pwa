export const PIN_LENGTH = 6;
export const PIN_PATTERN = /^\d{6}$/;

/** OWASP 2023 minimum for PBKDF2-HMAC-SHA256. */
export const PBKDF2_ITERATIONS = 600_000;
export const PIN_SALT_BYTES = 16;
export const PIN_HASH_BITS = 256;

/** After every 5th wrong PIN the app locks out for a while: 30s, 60s, 120s ... up to 15 min. */
export const PIN_ATTEMPTS_PER_TIER = 5;
export const LOCKOUT_BASE_MS = 30_000;
export const LOCKOUT_MAX_MS = 15 * 60_000;

export const APP_LOCK_MESSAGES = {
  invalidPin: "Enter a 6 digit PIN.",
} as const;
