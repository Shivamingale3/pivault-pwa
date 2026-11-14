import {
  PASSWORD_LIMITS,
  PASSWORD_RULE_LABELS,
  PasswordRuleId,
} from "@/constants/password.constants";
import type { PasswordRuleResult } from "@/interfaces/password.interface";

const checks: Record<PasswordRuleId, (password: string, confirm: string) => boolean> = {
  [PasswordRuleId.Length]: (password) =>
    password.length >= PASSWORD_LIMITS.min && password.length <= PASSWORD_LIMITS.max,
  [PasswordRuleId.Letters]: (password) => /[A-Z]/.test(password) && /[a-z]/.test(password),
  [PasswordRuleId.Symbols]: (password) => /\d/.test(password) && /[^A-Za-z0-9]/.test(password),
  [PasswordRuleId.Match]: (password, confirm) => confirm.length > 0 && password === confirm,
};

/** Live checklist for the "set a password" form, in display order. */
export const evaluatePasswordRules = (password: string, confirm: string): PasswordRuleResult[] =>
  Object.values(PasswordRuleId).map((id) => ({
    id,
    label: PASSWORD_RULE_LABELS[id],
    passed: checks[id](password, confirm),
  }));

export const allRulesPass = (rules: readonly PasswordRuleResult[]): boolean =>
  rules.every((rule) => rule.passed);
