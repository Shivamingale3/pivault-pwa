import { describe, expect, it } from "vitest";
import { LOCKOUT_MAX_MS } from "@/constants/app-lock.constants";
import { attemptsUntilLockout, lockoutDurationMs } from "@/utils/app-lock.utils";

describe("PIN lockout", () => {
  it("locks out only on every 5th miss, doubling up to the cap", () => {
    expect([1, 4, 6].map(lockoutDurationMs)).toEqual([0, 0, 0]);
    expect([5, 10, 15].map(lockoutDurationMs)).toEqual([30_000, 60_000, 120_000]);
    expect(lockoutDurationMs(500)).toBe(LOCKOUT_MAX_MS);
  });

  it("counts the guesses left", () => {
    expect([0, 1, 4, 5, 6].map(attemptsUntilLockout)).toEqual([5, 4, 1, 5, 4]);
  });
});
