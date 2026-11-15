import {
  LOCKOUT_BASE_MS,
  LOCKOUT_MAX_MS,
  PIN_ATTEMPTS_PER_TIER,
} from "@/constants/app-lock.constants";

/** How long to lock out after `failedAttempts` wrong PINs in a row (0 until the next 5th miss). */
export const lockoutDurationMs = (failedAttempts: number): number => {
  if (failedAttempts === 0 || failedAttempts % PIN_ATTEMPTS_PER_TIER !== 0) return 0;
  const tier = failedAttempts / PIN_ATTEMPTS_PER_TIER;
  return Math.min(LOCKOUT_BASE_MS * 2 ** (tier - 1), LOCKOUT_MAX_MS);
};

/** Wrong guesses left before the next lockout starts. */
export const attemptsUntilLockout = (failedAttempts: number): number =>
  PIN_ATTEMPTS_PER_TIER - (failedAttempts % PIN_ATTEMPTS_PER_TIER);
