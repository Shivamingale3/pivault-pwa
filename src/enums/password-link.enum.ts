/** Where the "set your password" screen is in its life. */
export const LinkPhase = {
  /** Asking the API whether the link is still usable. */
  Checking: "checking",
  Ready: "ready",
  /** Unknown, expired, spent or malformed link. */
  Invalid: "invalid",
  /** The check could not complete (offline, timeout, server error): safe to retry. */
  Unavailable: "unavailable",
  Submitting: "submitting",
  Success: "success",
} as const;

export type LinkPhase = (typeof LinkPhase)[keyof typeof LinkPhase];
