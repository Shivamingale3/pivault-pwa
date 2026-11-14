import { useState } from "react";
import type { FieldMatch } from "@/interfaces/password.interface";
import { allRulesPass, evaluatePasswordRules } from "@/utils/password-rules.utils";

/** State and derived checks for a "new password + confirmation" form. */
export function useSetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const rules = evaluatePasswordRules(password, confirm);
  const valid = allRulesPass(rules);

  let confirmMatch: FieldMatch = "idle";
  if (confirm.length > 0) {
    if (confirm === password) confirmMatch = "match";
    else if (!password.startsWith(confirm)) confirmMatch = "mismatch";
  }

  return { password, setPassword, confirm, setConfirm, rules, valid, confirmMatch };
}
