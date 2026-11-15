export type PinResult =
  | { ok: true }
  | { ok: false; reason: "wrong"; attemptsLeft: number }
  | { ok: false; reason: "locked-out"; retryAfterMs: number };
