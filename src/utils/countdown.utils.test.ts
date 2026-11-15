import { describe, expect, it } from "vitest";
import { formatCountdown } from "@/utils/countdown.utils";

describe("formatCountdown", () => {
  it("formats minutes and seconds, rounding up", () => {
    expect(formatCountdown(30_000)).toBe("0:30");
    expect(formatCountdown(65_000)).toBe("1:05");
    expect(formatCountdown(29_001)).toBe("0:30");
    expect(formatCountdown(900_000)).toBe("15:00");
  });

  it("never goes negative", () => {
    expect(formatCountdown(-5)).toBe("0:00");
  });
});
