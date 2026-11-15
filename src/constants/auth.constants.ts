/** How long an emailed reset link works. Matches `RESET_LINK_MINUTES` in the backend. */
export const RESET_LINK_MINUTES = 15;

export const SESSION_MISSING_MESSAGE = "Sign in again to continue.";

/**
 * What the device signs for each authenticated request. Must match `signaturePayload` in the
 * backend's session.constants.ts. `path` is the full path with no query string, e.g. /api/auth/logout.
 */
export const signaturePayload = (timestamp: string, method: string, path: string): string =>
  `${timestamp}.${method.toUpperCase()}.${path}`;

export const BIOMETRIC_MESSAGES = {
  failed: "Biometric unlock couldn't be set up. You can still use your PIN.",
  unsupported: "This device can't use biometric unlock.",
} as const;
