import { useState } from "react";
import { PIN_LENGTH } from "@/constants/app-lock.constants";
import { PIN_MESSAGES } from "@/constants/setup.constants";
import { isWeakPin } from "@/utils/pin.utils";

export type PinStep = "create" | "confirm";

/** Two-step PIN entry: type it, then type it again. `pin` is set only once both match. */
export function usePinSetup() {
  const [step, setStep] = useState<PinStep>("create");
  const [first, setFirst] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);

  const restart = (message: string | null) => {
    setFirst("");
    setValue("");
    setStep("create");
    setPin(null);
    setError(message);
  };

  const onChange = (next: string) => {
    setValue(next);
    setError(null);
    if (next.length < PIN_LENGTH) return;
    if (step === "create") {
      if (isWeakPin(next)) {
        setValue("");
        setError(PIN_MESSAGES.weak);
        return;
      }
      setFirst(next);
      setValue("");
      setStep("confirm");
    } else if (next === first) {
      setPin(next);
    } else {
      restart(PIN_MESSAGES.mismatch);
    }
  };

  return { step, value, error, pin, onChange, restart };
}
