import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function EmailField({ id, value, onChange, disabled, autoFocus }: EmailFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>Email</Label>
      <Input
        id={id}
        name={id}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="you@example.com"
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </div>
  );
}
