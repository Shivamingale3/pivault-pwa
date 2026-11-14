/** Why an API call failed, so callers can react without parsing messages. */
export const ApiErrorKind = {
  /** The request never got an answer (offline, DNS, blocked). */
  Network: "network",
  Timeout: "timeout",
  /** The server answered with a non-2xx status. */
  Http: "http",
  /** The server answered 2xx but not with the documented shape. */
  InvalidResponse: "invalid-response",
} as const;

export type ApiErrorKind = (typeof ApiErrorKind)[keyof typeof ApiErrorKind];
