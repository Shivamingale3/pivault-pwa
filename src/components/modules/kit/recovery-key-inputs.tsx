import { type ClipboardEvent, type KeyboardEvent, useRef } from "react";
import { RECOVERY_KEY_GROUP_SIZE, RECOVERY_KEY_HEX_LENGTH } from "@/constants/crypto.constants";
import { cn } from "@/lib/utils";

const GROUPS = RECOVERY_KEY_HEX_LENGTH / RECOVERY_KEY_GROUP_SIZE;
/** A whole key as displayed (hyphens between groups) and then some, for stray spaces. */
const PASTE_ROOM = RECOVERY_KEY_HEX_LENGTH * 2;
const clean = (text: string): string => text.toLowerCase().replace(/[^0-9a-f]/g, "");

interface RecoveryKeyInputsProps {
  /** The characters entered so far, 0 to 64 lowercase hex characters. */
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  /** Changing this replays the shake. */
  shakeKey?: number;
  /** Enter pressed in any box (a disabled submit button can't be pressed implicitly). */
  onEnter?: () => void;
}

/**
 * Eight boxes of eight characters. Only 0-9 and a-f are accepted; a full group moves to the next
 * box; pasting the whole key into any box fills the boxes from there.
 */
export function RecoveryKeyInputs({
  value,
  onChange,
  invalid,
  disabled,
  shakeKey = 0,
  onEnter,
}: RecoveryKeyInputsProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const groupAt = (index: number): string =>
    value.slice(index * RECOVERY_KEY_GROUP_SIZE, (index + 1) * RECOVERY_KEY_GROUP_SIZE);

  /** Typing edits one group; pasting more than a group replaces everything from here on. */
  const set = (index: number, text: string) => {
    const start = index * RECOVERY_KEY_GROUP_SIZE;
    const before = value.slice(0, start);
    const next = clean(text);
    const tail =
      next.length > RECOVERY_KEY_GROUP_SIZE ? "" : value.slice(start + RECOVERY_KEY_GROUP_SIZE);
    const updated = (before + next + tail).slice(0, RECOVERY_KEY_HEX_LENGTH);
    onChange(updated);
    if (next.length >= RECOVERY_KEY_GROUP_SIZE) {
      const target = Math.min(Math.floor(updated.length / RECOVERY_KEY_GROUP_SIZE), GROUPS - 1);
      refs.current[target]?.focus();
    }
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onEnter?.();
    } else if (event.key === "Backspace" && groupAt(index) === "" && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const onPaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const text = clean(event.clipboardData.getData("text"));
    if (text.length <= RECOVERY_KEY_GROUP_SIZE) return;
    event.preventDefault();
    set(index, text);
  };

  return (
    <div
      key={shakeKey}
      className={cn("grid grid-cols-2 gap-2.5", invalid && shakeKey > 0 && "animate-shake")}
    >
      {Array.from({ length: GROUPS }, (_, index) => {
        const group = groupAt(index);
        return (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            aria-label={`Recovery key, group ${String(index + 1)} of ${String(GROUPS)}`}
            aria-invalid={invalid}
            autoFocus={index === 0}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={disabled}
            // Room for a whole pasted key with its hyphens and spaces. A phone keyboard's paste arrives
            // as typing, so a limit of 64 cut the key short and the last box got one character.
            maxLength={PASTE_ROOM}
            placeholder="XXXXXXXX"
            value={group.toUpperCase()}
            onChange={(event) => {
              set(index, event.target.value);
            }}
            onKeyDown={(event) => {
              onKeyDown(index, event);
            }}
            onPaste={(event) => {
              onPaste(index, event);
            }}
            className={cn(
              "h-14.5 min-w-0 rounded-lg border-[1.5px] bg-muted px-3.5 text-center font-mono text-[0.9375rem] font-bold tracking-widest transition-colors outline-none placeholder:text-subtle focus-visible:border-foreground focus-visible:bg-background disabled:opacity-50",
              group.length === RECOVERY_KEY_GROUP_SIZE ? "border-foreground" : "border-input",
              invalid && "border-destructive",
            )}
          />
        );
      })}
    </div>
  );
}
