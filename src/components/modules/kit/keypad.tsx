import { DeleteIcon } from "lucide-react";
import { BiometricIcon } from "@/components/modules/kit/biometric-icon";
import { cn } from "@/lib/utils";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

interface KeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  /** Shows the biometric key in the bottom-left cell (unlock only). */
  onBiometric?: () => void;
  /** The biometric glyph pulses while a scan is running. */
  scanning?: boolean;
  /** Lockout: the whole pad at 40% and out of the tab order. */
  disabled?: boolean;
}

const KEY =
  "flex h-20 w-full items-center justify-center bg-hero text-[1.8125rem] font-medium tracking-tight text-hero-foreground outline-none transition-colors active:bg-hero-foreground/14 focus-visible:bg-hero-foreground/14 disabled:pointer-events-none [&_svg]:size-6.5";
const CELL = "border-hero-foreground/10 not-nth-[3n]:border-r not-nth-[-n+3]:border-t";

/** The dark 3 x 4 keypad. Each key is a real button; digits and backspace work from a keyboard too. */
export function Keypad({ onDigit, onBackspace, onBiometric, scanning, disabled }: KeypadProps) {
  const lock = disabled ? { disabled: true, tabIndex: -1 } : {};
  return (
    <div
      role="group"
      aria-label="PIN keypad"
      className={cn(
        "grid grid-cols-3 overflow-hidden rounded-[1.875rem] bg-hero",
        disabled && "opacity-40 [&_button]:h-18.5",
      )}
    >
      {DIGITS.map((digit) => (
        <div key={digit} className={CELL}>
          <button
            type="button"
            className={KEY}
            aria-label={digit}
            onClick={() => {
              onDigit(digit);
            }}
            {...lock}
          >
            {digit}
          </button>
        </div>
      ))}
      <div className={CELL}>
        {onBiometric ? (
          <button
            type="button"
            className={cn(KEY, scanning && "animate-pulse-soft")}
            aria-label="Unlock with biometrics"
            onClick={onBiometric}
            {...lock}
          >
            <BiometricIcon />
          </button>
        ) : (
          <span aria-hidden="true" className={cn(KEY, "block")} />
        )}
      </div>
      <div className={CELL}>
        <button
          type="button"
          className={KEY}
          aria-label="0"
          onClick={() => {
            onDigit("0");
          }}
          {...lock}
        >
          0
        </button>
      </div>
      <div className={CELL}>
        <button
          type="button"
          className={KEY}
          aria-label="Backspace"
          onClick={onBackspace}
          {...lock}
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
}
