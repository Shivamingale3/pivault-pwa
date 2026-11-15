import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SETUP_COPY } from "@/constants/setup.constants";

interface BiometricOptionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function BiometricOption({ checked, onChange, disabled }: BiometricOptionProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-muted px-4.5 py-3.5">
      <div className="flex flex-col gap-1">
        <Label htmlFor="biometric">{SETUP_COPY.biometricLabel}</Label>
        <p className="text-xs font-medium text-muted-foreground">{SETUP_COPY.biometricHint}</p>
      </div>
      <Switch id="biometric" checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
