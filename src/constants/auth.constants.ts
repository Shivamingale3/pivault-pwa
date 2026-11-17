/** How long an emailed reset link works. Matches `RESET_LINK_MINUTES` in the backend. */
export const RESET_LINK_MINUTES = 15;

export const SESSION_MISSING_MESSAGE = "Sign in again to continue.";

/**
 * What the device signs for each authenticated request. Must match `signaturePayload` in the
 * backend's session.constants.ts. `path` is the full path with no query string, e.g.
 * /api/auth/logout; `bodyHash` is the SHA-256 of the exact body bytes (base64url), also sent as
 * `X-Body-SHA256`, so a captured request can't be re-sent with a different body.
 */
export const signaturePayload = (
  timestamp: string,
  method: string,
  path: string,
  bodyHash: string,
): string => `${timestamp}.${method.toUpperCase()}.${path}.${bodyHash}`;

/** A fixed text encrypted with the vault key: a new device decrypts it to prove a typed recovery key. */
export const KEY_CHECK_TEXT = "pivault-key-check";
export const KEY_CHECK_AAD = "pivault/key-check";

export const BIOMETRIC_MESSAGES = {
  failed: "Biometric unlock couldn't be set up. You can still use your PIN.",
  unsupported: "This device can't use biometric unlock.",
} as const;
