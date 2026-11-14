import type { PasswordRuleId } from "@/constants/password.constants";

export interface PasswordRuleResult {
  id: PasswordRuleId;
  label: string;
  passed: boolean;
}

/** Border feedback of a confirmation field: ink when equal, destructive when it can no longer match. */
export type FieldMatch = "idle" | "match" | "mismatch";
