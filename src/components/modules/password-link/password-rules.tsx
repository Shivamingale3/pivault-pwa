import { CheckIcon } from "lucide-react";
import type { PasswordRuleResult } from "@/interfaces/password.interface";
import { cn } from "@/lib/utils";

interface PasswordRulesProps {
  rules: readonly PasswordRuleResult[];
}

/** Live checklist of the password policy: a ticked circle per rule that currently passes. */
export function PasswordRules({ rules }: PasswordRulesProps) {
  return (
    <ul aria-label="Password rules" className="flex flex-col gap-2.5 px-1">
      {rules.map((rule) => (
        <li
          key={rule.id}
          className={cn(
            "flex items-center gap-2.5 text-xs font-semibold transition-colors",
            rule.passed ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex size-4.5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
              rule.passed
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border-strong",
            )}
          >
            {rule.passed && <CheckIcon className="size-3" strokeWidth={3} />}
          </span>
          {rule.label}
          <span className="sr-only">{rule.passed ? "(met)" : "(not met)"}</span>
        </li>
      ))}
    </ul>
  );
}
