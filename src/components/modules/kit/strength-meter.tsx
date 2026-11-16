import { STRENGTH_LABELS } from "@/constants/vault-design.constants";
import { cn } from "@/lib/utils";
import { passwordStrength } from "@/utils/password-strength.utils";

/** Four small segments and a word for how strong the password looks. */
export function StrengthMeter({ password }: { password: string }) {
  const score = passwordStrength(password);
  const label = STRENGTH_LABELS[score];
  return (
    <div role="img" aria-label={`Strength: ${label}`} className="flex items-center gap-3">
      <span aria-hidden="true" className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-0.75 w-5.5 rounded-full",
              segment <= score ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </span>
      <span aria-hidden="true" className="text-[0.71875rem] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
