import { describe, expect, it } from "vitest";
import { formatLastUsed } from "@/utils/last-used.utils";

const NOW = 1_800_000_000_000;
const H = 3_600_000;
const D = 24 * H;

describe("formatLastUsed", () => {
  it.each([
    [NOW - 5 * 60_000, "5M AGO"],
    [NOW - 2 * H, "2H AGO"],
    [NOW - D - H, "YESTERDAY"],
    [NOW - 3 * D, "3 DAYS"],
    [NOW - 7 * D, "1 WEEK"],
    [NOW - 14 * D, "2 WEEKS"],
    [NOW - 31 * D, "1 MONTH"],
    [NOW - 75 * D, "2 MONTHS"],
  ])("%d is %s", (when, expected) => {
    expect(formatLastUsed(when, NOW)).toBe(expected);
  });
});
