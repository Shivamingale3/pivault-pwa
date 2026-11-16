import { LOCKOUT_WAITS_MS, PIN_ATTEMPTS_PER_TIER } from "@/constants/app-lock.constants";

/** The wait after the `round`-th run of wrong PINs (1-based): 30 s, 5 min, then 1 hour for ever. */
const waitForRound = (round: number): number =>
  LOCKOUT_WAITS_MS[Math.min(round, LOCKOUT_WAITS_MS.length) - 1] ?? 0;

/** How long to lock out after `failedAttempts` wrong PINs in a row (0 until the next 5th miss). */
export const lockoutDurationMs = (failedAttempts: number): number =>
  failedAttempts === 0 || failedAttempts % PIN_ATTEMPTS_PER_TIER !== 0
    ? 0
    : waitForRound(failedAttempts / PIN_ATTEMPTS_PER_TIER);

/** Wrong guesses left before the next lockout starts. */
export const attemptsUntilLockout = (failedAttempts: number): number =>
  PIN_ATTEMPTS_PER_TIER - (failedAttempts % PIN_ATTEMPTS_PER_TIER);

/** Which wrong PIN of its round this is (1 to 5): "Attempt 5 of 5". */
export const attemptInRound = (failedAttempts: number): number =>
  ((Math.max(failedAttempts, 1) - 1) % PIN_ATTEMPTS_PER_TIER) + 1;

/** The wait that follows the round `failedAttempts` is in: named in the lockout caption. */
export const nextWaitMs = (failedAttempts: number): number =>
  waitForRound(Math.ceil(Math.max(failedAttempts, 1) / PIN_ATTEMPTS_PER_TIER) + 1);
