import { DicesIcon, SlidersHorizontalIcon } from "lucide-react";
import { StrengthMeter } from "@/components/modules/kit/strength-meter";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Dice: a new password with the current generator settings. */
  onReroll: () => void;
  /** Sliders: open the generator sheet. */
  onOpenGenerator: () => void;
}

/** The form's password field: mono value, dice and sliders inside on the right, strength under it. */
export function PasswordInput({
  id,
  value,
  onChange,
  onReroll,
  onOpenGenerator,
}: PasswordInputProps) {
  return (
    <>
      <InputGroup>
        <InputGroupInput
          id={id}
          name={id}
          value={value}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="font-mono font-bold"
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Generate a new password"
            size="icon-sm"
            variant="outline"
            onClick={onReroll}
          >
            <DicesIcon />
          </InputGroupButton>
          <InputGroupButton
            aria-label="Generator settings"
            size="icon-sm"
            variant="ghost"
            onClick={onOpenGenerator}
          >
            <SlidersHorizontalIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {value !== "" && (
        <div className="px-1">
          <StrengthMeter password={value} />
        </div>
      )}
    </>
  );
}
