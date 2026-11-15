import { useToggle } from "@/hooks/use-toggle";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { FieldMatch } from "@/interfaces/password.interface";
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  /** `current-password` for sign in; a new password is the default. */
  autoComplete?: "new-password" | "current-password";
  /** Border feedback for confirmation fields: ink when equal, destructive when it cannot match. */
  match?: FieldMatch;
}

/** Password input with a Show / Hide toggle. */
export function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  disabled,
  autoFocus,
  autoComplete = "new-password",
  match = "idle",
}: PasswordFieldProps) {
  const [visible, toggle] = useToggle();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <InputGroup
        className={cn(
          match === "match" && "border-foreground",
          match === "mismatch" && "border-destructive",
        )}
      >
        <InputGroupInput
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={match === "mismatch"}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="sm"
            aria-pressed={visible}
            aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
            disabled={disabled}
            onClick={toggle}
          >
            {visible ? "Hide" : "Show"}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
