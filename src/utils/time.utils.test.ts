import { describe, expect, it } from "vitest";
import { formatRelative, formatWhen } from "@/utils/time.utils";

const NOW = new Date("2026-11-15T10:00:00").getTime();
const at = (iso: string) => new Date(iso).getTime();

describe("formatRelative", () => {
  it.each([
    [NOW - 5_000, "just now"],
    [NOW - 4 * 60_000, "4 min ago"],
    [NOW - 59 * 60_000, "59 min ago"],
    [NOW - 3 * 3_600_000, "3 h ago"],
    [NOW - 2 * 86_400_000, "2 d ago"],
  ])("%d is %s", (when, expected) => {
    expect(formatRelative(when, NOW)).toBe(expected);
  });

  it("never reports the future", () => {
    expect(formatRelative(NOW + 60_000, NOW)).toBe("just now");
  });
});

describe("formatWhen", () => {
  it("says today and yesterday with a 24 hour time", () => {
    expect(formatWhen(at("2026-11-15T09:52:00"), NOW)).toBe("Today at 09:52");
    expect(formatWhen(at("2026-11-14T23:05:00"), NOW)).toBe("Yesterday at 23:05");
  });

  it("gives the date for anything older", () => {
    expect(formatWhen(at("2026-11-10T08:01:00"), NOW)).toMatch(/(Nov 10|10 Nov) at 08:01/);
  });
});
