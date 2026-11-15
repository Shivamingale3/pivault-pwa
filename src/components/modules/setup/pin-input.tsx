import { REGEXP_ONLY_DIGITS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { PIN_LENGTH } from "@/constants/app-lock.constants";

interface PinInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}

/** Six masked digit boxes. Numeric keyboard on phones, bullets instead of digits. */
export function PinInput({ id, label, value, onChange, disabled, invalid }: PinInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <InputOTP
        id={id}
        maxLength={PIN_LENGTH}
        inputMode="numeric"
        pattern={REGEXP_ONLY_DIGITS}
        autoComplete="off"
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={invalid}
        autoFocus
      >
        <InputOTPGroup>
          {Array.from({ length: PIN_LENGTH }, (_, index) => (
            <InputOTPSlot key={index} index={index} aria-invalid={invalid} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
