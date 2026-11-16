import { describe, expect, it } from "vitest";
import { domainOf, formatDay } from "@/utils/date-format.utils";

describe("date and domain", () => {
  it("formats a day", () => {
    expect(formatDay(new Date("2024-03-14T10:00:00").getTime())).toBe("14 Mar 2024");
  });
  it.each([
    ["https://www.github.com/login", "github.com"],
    ["http://pi.local:8080", "pi.local"],
    ["javascript:alert(1)", ""],
    ["not a url", ""],
  ])("domain of %s is %j", (url, expected) => {
    expect(domainOf(url)).toBe(expected);
  });
});
