import type { PasswordRuleId } from "@/constants/password.constants";

export interface PasswordRuleResult {
  id: PasswordRuleId;
  label: string;
  passed: boolean;
}
