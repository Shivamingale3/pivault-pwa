import { describe, expect, it } from "vitest";
import { PasswordRuleId } from "@/constants/password.constants";
import { allRulesPass, evaluatePasswordRules } from "@/utils/password-rules.utils";

const passed = (password: string, confirm: string) =>
  Object.fromEntries(evaluatePasswordRules(password, confirm).map((r) => [r.id, r.passed]));

describe("evaluatePasswordRules", () => {
  it("lists the rules in display order", () => {
    expect(evaluatePasswordRules("", "").map((r) => r.id)).toEqual([
      PasswordRuleId.Length,
      PasswordRuleId.Letters,
      PasswordRuleId.Symbols,
      PasswordRuleId.Match,
    ]);
  });

  it("passes nothing for empty input", () => {
    expect(allRulesPass(evaluatePasswordRules("", ""))).toBe(false);
    expect(Object.values(passed("", "")).some(Boolean)).toBe(false);
  });

  it.each([
    ["7 characters", "Pw0!abc", false],
    ["8 characters", "Pw0!abcd", true],
    ["16 characters", "Pw0!abcdefghijkl", true],
    ["17 characters", "Pw0!abcdefghijklm", false],
  ])("checks the length: %s", (_name, password, expected) => {
    expect(passed(password, "")[PasswordRuleId.Length]).toBe(expected);
  });

  it("needs both cases", () => {
    expect(passed("password", "")[PasswordRuleId.Letters]).toBe(false);
    expect(passed("PASSWORD", "")[PasswordRuleId.Letters]).toBe(false);
    expect(passed("Password", "")[PasswordRuleId.Letters]).toBe(true);
  });

  it("needs a digit and a special character together", () => {
    expect(passed("abc123", "")[PasswordRuleId.Symbols]).toBe(false);
    expect(passed("abc!!!", "")[PasswordRuleId.Symbols]).toBe(false);
    expect(passed("abc1!", "")[PasswordRuleId.Symbols]).toBe(true);
  });

  it("matches only a non-empty identical confirmation", () => {
    expect(passed("Passw0rd!", "")[PasswordRuleId.Match]).toBe(false);
    expect(passed("Passw0rd!", "Passw0rd?")[PasswordRuleId.Match]).toBe(false);
    expect(passed("Passw0rd!", "Passw0rd!")[PasswordRuleId.Match]).toBe(true);
  });

  it("accepts a password the API would accept", () => {
    expect(allRulesPass(evaluatePasswordRules("Passw0rd!", "Passw0rd!"))).toBe(true);
  });
});
