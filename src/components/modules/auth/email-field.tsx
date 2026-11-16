import { CheckIcon, MailIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

interface EmailFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Checked on blur only, as the design asks. */
  onBlur?: () => void;
  label?: string;
  placeholder?: string;
  /** Red border (set after blur when the address isn't well formed). */
  invalid?: boolean;
  /** Shows the tick: the address is well formed. */
  valid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

/** Email with a leading mail icon and a tick once the address looks right. */
export function EmailField({
  id,
  value,
  onChange,
  onBlur,
  label = "Email",
  placeholder = "you@email.com",
  invalid,
  valid,
  disabled,
  autoFocus,
}: EmailFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <MailIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          name={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={invalid}
          onBlur={onBlur}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
        {valid === true && (
          <InputGroupAddon align="inline-end">
            <span
              role="img"
              aria-label="Looks good"
              className="flex size-4.25 items-center justify-center rounded-full bg-foreground text-background"
            >
              <CheckIcon aria-hidden="true" className="size-2.5!" strokeWidth={3} />
            </span>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  );
}
