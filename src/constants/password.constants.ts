/**
 * Account-password policy. Mirrors the API (backend `PASSWORD_RULES`): the account password is
 * short on purpose so people can remember it. The vault is protected by the recovery key instead.
 */
export const PASSWORD_LIMITS = { min: 8, max: 16 } as const;

export const PasswordRuleId = {
  Length: "length",
  Letters: "letters",
  Symbols: "symbols",
  Match: "match",
} as const;

export type PasswordRuleId = (typeof PasswordRuleId)[keyof typeof PasswordRuleId];

export const PASSWORD_RULE_LABELS: Record<PasswordRuleId, string> = {
  [PasswordRuleId.Length]: `${PASSWORD_LIMITS.min} to ${PASSWORD_LIMITS.max} characters`,
  [PasswordRuleId.Letters]: "Upper and lower case letters",
  [PasswordRuleId.Symbols]: "A number and a special character",
  [PasswordRuleId.Match]: "Both entries match",
};
