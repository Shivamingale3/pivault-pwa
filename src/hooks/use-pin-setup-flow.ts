import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { BIOMETRIC_MESSAGES } from "@/constants/auth.constants";
import { PIN_MESSAGES } from "@/constants/setup.constants";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useBiometricAvailable } from "@/hooks/use-biometric-available";
import { usePinEntry } from "@/hooks/use-pin-entry";
import { ROUTES } from "@/routes/route-paths";
import { finishRecoveredSetup, configureAppLock } from "@/services/setup.service";
import { loadSession } from "@/services/session.service";
import { isWeakPin } from "@/utils/pin.utils";

const STEP_DELAY_MS = 160;

/**
 * Set the app PIN in two steps (enter, then confirm), offer Face ID once it matches, save, and move
 * on: a first-time user goes to the recovery key, a user on a new phone is done.
 */
export function usePinSetupFlow() {
  const navigate = useNavigate();
  const { completeSetup } = useAuth();
  const request = useAuthRequest();
  const faceAvailable = useBiometricAvailable();
  const [step, setStep] = useState<1 | 2>(1);
  const [message, setMessage] = useState<string | null>(null);
  const [offer, setOffer] = useState(false);
  const first = useRef("");
  const chosen = useRef("");

  const save = async (withFace: boolean) => {
    const done = await request.run(async () => {
      const result = await configureAppLock(chosen.current, withFace);
      if (result.biometricFailed) toast.error(BIOMETRIC_MESSAGES.failed);
      const session = await loadSession();
      if (session?.recoveryKeyConfigured) {
        await finishRecoveredSetup();
        return "done" as const;
      }
      return "key" as const;
    });
    if (done === "done") completeSetup();
    else if (done === "key") void navigate(ROUTES.setupRecoveryKey, { replace: true });
  };

  const entry = usePinEntry({
    disabled: request.pending || offer,
    onComplete: (pin) => {
      if (step === 1) {
        if (isWeakPin(pin)) {
          setMessage(PIN_MESSAGES.weak);
          entry.shake();
          return;
        }
        first.current = pin;
        setMessage(null);
        setTimeout(() => {
          setStep(2);
          entry.clear();
        }, STEP_DELAY_MS);
      } else if (pin === first.current) {
        chosen.current = pin;
        setMessage(null);
        if (faceAvailable) setOffer(true);
        else void save(false);
      } else {
        setMessage(PIN_MESSAGES.mismatch);
        entry.shake();
      }
    },
  });

  return {
    step,
    entry,
    message: message ?? request.error,
    pending: request.pending,
    offer,
    answerOffer: (withFace: boolean) => {
      setOffer(false);
      void save(withFace);
    },
  };
}
