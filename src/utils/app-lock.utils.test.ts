import { describe, expect, it } from "vitest";
import {
  attemptInRound,
  attemptsUntilLockout,
  lockoutDurationMs,
  nextWaitMs,
} from "@/utils/app-lock.utils";

const SEC = 1000;
const MIN = 60 * SEC;

describe("PIN lockout", () => {
  it("locks out only on every 5th miss: 30 s, 5 min, then 1 hour for ever", () => {
    expect([1, 4, 6].map(lockoutDurationMs)).toEqual([0, 0, 0]);
    expect([5, 10, 15, 20, 500].map(lockoutDurationMs)).toEqual([
      30 * SEC,
      5 * MIN,
      60 * MIN,
      60 * MIN,
      60 * MIN,
    ]);
  });

  it("counts the guesses left", () => {
    expect([0, 1, 4, 5, 6].map(attemptsUntilLockout)).toEqual([5, 4, 1, 5, 4]);
  });

  it("numbers the attempt within its round", () => {
    expect([1, 2, 5, 6, 10].map(attemptInRound)).toEqual([1, 2, 5, 1, 5]);
  });

  it("names the wait that comes next", () => {
    expect([5, 10, 15, 20].map(nextWaitMs)).toEqual([5 * MIN, 60 * MIN, 60 * MIN, 60 * MIN]);
  });
});
