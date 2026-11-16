import { PIN_LENGTH } from "@/constants/app-lock.constants";
import { cn } from "@/lib/utils";

interface PinCellsProps {
  value: string;
  /** Bullets instead of digits (always on during setup; a "Show PIN" toggle on unlock). */
  masked?: boolean;
  invalid?: boolean;
  /** Changing this replays the shake after a wrong entry. */
  shakeKey?: number;
}

/**
 * Six equal cells that show the PIN being typed on the keypad. Empty cells are plain, the next one
 * to fill has a faint ink border, filled ones are muted with an ink border.
 */
export function PinCells({ value, masked = true, invalid = false, shakeKey = 0 }: PinCellsProps) {
  return (
    <div
      key={shakeKey}
      role="group"
      aria-label={`${String(value.length)} of ${String(PIN_LENGTH)} digits entered`}
      className={cn("flex w-full gap-2", invalid && shakeKey > 0 && "animate-shake")}
    >
      {Array.from({ length: PIN_LENGTH }, (_, index) => {
        const digit = value[index];
        const next = index === value.length;
        return (
          <span
            key={index}
            aria-hidden="true"
            className={cn(
              "flex h-14.5 min-w-0 flex-1 items-center justify-center rounded-[1.0625rem] border-[1.5px] text-[1.375rem] font-semibold transition-colors",
              digit === undefined ? "border-border bg-background" : "border-foreground bg-muted",
              next && "border-foreground/35 dark:border-foreground/42",
              invalid && "border-destructive",
            )}
          >
            {digit !== undefined && (masked ? "•" : digit)}
          </span>
        );
      })}
    </div>
  );
}
