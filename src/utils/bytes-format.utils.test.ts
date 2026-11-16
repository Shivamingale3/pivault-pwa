import { describe, expect, it } from "vitest";
import { formatBytes } from "@/utils/bytes-format.utils";

describe("formatBytes", () => {
  it.each([
    [400_000, "0.4 MB"],
    [312_000_000, "312 MB"],
    [1_500_000_000, "1.5 GB"],
  ])("%d is %s", (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});
