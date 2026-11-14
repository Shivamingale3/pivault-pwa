/** Query parameter that carries the emailed token (`/reset-password?key=...`). */
export const LINK_TOKEN_PARAM = "key";

/** Backend token shape: 32 random bytes as base64url. Anything else cannot be a real link. */
export const LINK_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/**
 * What the API answers (HTTP 400) for any unknown, expired, spent or malformed link.
 * Must match `INVALID_LINK_MESSAGE` in the backend's passwordLink.constants.ts.
 */
export const INVALID_LINK_MESSAGE = "This link is invalid or has expired";
