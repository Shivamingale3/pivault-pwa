import { describe, expect, it } from "vitest";
import { isWeak, passwordStrength } from "@/utils/password-strength.utils";

describe("passwordStrength", () => {
  it.each([
    ["", 0],
    ["aaaaaaaaaaaa", 0],
    ["abab", 0],
    ["Ab1!", 1],
    ["abcdefgh", 1],
    ["abcdefghijkl", 2],
    ["Abcdefgh1!", 2],
    ["Abcdefghijk1!", 3],
    ["Abcdefghijklmnop1!", 4],
  ] as const)("%j scores %d", (password, expected) => {
    expect(passwordStrength(password)).toBe(expected);
  });

  it("calls short, plain or repetitive passwords weak, and long mixed ones fine", () => {
    expect(isWeak("hunter2")).toBe(true);
    expect(isWeak("Abcdefghijk1!")).toBe(false);
  });
});
