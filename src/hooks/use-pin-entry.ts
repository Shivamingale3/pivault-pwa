import { useCallback, useEffect, useRef, useState } from "react";
import { PIN_LENGTH } from "@/constants/app-lock.constants";

interface UsePinEntryOptions {
  /** Ignores input (lockout, or while a check is running). */
  disabled?: boolean;
  /** Called once when the sixth digit lands. */
  onComplete?: (pin: string) => void;
}

/**
 * The digits typed so far, from the on-screen keypad or a physical keyboard. `shake` replays the
 * wrong-entry animation, `clear` empties the cells.
 */
export function usePinEntry({ disabled = false, onComplete }: UsePinEntryOptions = {}) {
  const [value, setValue] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const complete = useRef(onComplete);
  useEffect(() => {
    complete.current = onComplete;
  });

  const digit = useCallback(
    (next: string) => {
      if (disabled) return;
      setValue((current) => (current.length >= PIN_LENGTH ? current : current + next));
    },
    [disabled],
  );

  const backspace = useCallback(() => {
    if (!disabled) setValue((current) => current.slice(0, -1));
  }, [disabled]);

  const clear = useCallback(() => {
    setValue("");
  }, []);

  const shake = useCallback(() => {
    setValue("");
    setShakeKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (value.length === PIN_LENGTH) complete.current?.(value);
  }, [value]);

  useEffect(() => {
    if (disabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^\d$/.test(event.key)) digit(event.key);
      else if (event.key === "Backspace") backspace();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [disabled, digit, backspace]);

  return { value, digit, backspace, clear, shake, shakeKey };
}
