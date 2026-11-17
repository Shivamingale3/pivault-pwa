import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { wrongPinMessage } from "@/constants/lock.constants";
import { CHANGE_PIN_COPY } from "@/constants/settings.constants";
import { PIN_MESSAGES } from "@/constants/setup.constants";
import { useAuth } from "@/hooks/use-auth";
import { usePinEntry } from "@/hooks/use-pin-entry";
import { ROUTES } from "@/routes/route-paths";
import { setPin, verifyPin } from "@/services/app-lock.service";
import { errorMessage } from "@/utils/error-message.utils";
import { isWeakPin } from "@/utils/pin.utils";

const STEP_DELAY_MS = 160;

/**
 * Change PIN in three steps: the current PIN, a new one, the new one again. Wrong current PINs
 * count like wrong unlocks; the fifth locks the app, where the wait is shown.
 */
export function useChangePinFlow() {
  const navigate = useNavigate();
  const { lock } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const next = useRef("");

  const advance = (to: 2 | 3) => {
    setMessage(null);
    setTimeout(() => {
      setStep(to);
      entry.clear();
    }, STEP_DELAY_MS);
  };

  const refuse = (text: string) => {
    setMessage(text);
    entry.shake();
  };

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    try {
      await task();
    } catch (error) {
      entry.clear();
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const entry = usePinEntry({
    disabled: busy,
    onComplete: (pin) => {
      if (step === 1) {
        void run(async () => {
          const result = await verifyPin(pin);
          if (result.ok) advance(2);
          else if (result.reason === "locked-out") lock();
          else refuse(wrongPinMessage(result.attemptsLeft));
        });
      } else if (step === 2) {
        if (isWeakPin(pin)) {
          refuse(PIN_MESSAGES.weak);
          return;
        }
        next.current = pin;
        advance(3);
      } else if (pin !== next.current) {
        refuse(PIN_MESSAGES.mismatch);
      } else {
        void run(async () => {
          await setPin(pin);
          toast.success(CHANGE_PIN_COPY.done);
          void navigate(ROUTES.settingsSecurity, { replace: true });
        });
      }
    },
  });

  return { step, entry, message, busy };
}
