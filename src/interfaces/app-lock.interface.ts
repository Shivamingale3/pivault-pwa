/** The state behind "Attempt 5 of 5 · next wait 5 min". */
export interface PinLock {
  retryAfterMs: number;
  attempt: number;
  attemptsPerRound: number;
  nextWaitMs: number;
}

export type PinResult =
  | { ok: true }
  | { ok: false; reason: "wrong"; attemptsLeft: number }
  | ({ ok: false; reason: "locked-out" } & PinLock);
