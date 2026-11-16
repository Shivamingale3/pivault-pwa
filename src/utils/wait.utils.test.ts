import { describe, expect, it } from "vitest";
import { formatWait } from "@/utils/wait.utils";

describe("formatWait", () => {
  it.each([
    [30, "30 sec"],
    [300, "5 min"],
    [3600, "1 hour"],
    [7200, "2 hours"],
  ])("%d s is %s", (seconds, expected) => {
    expect(formatWait(seconds)).toBe(expected);
  });
});
