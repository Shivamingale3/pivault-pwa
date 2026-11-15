import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PIN_LENGTH } from "@/constants/app-lock.constants";
import { lockedOutMessage, wrongPinMessage } from "@/constants/lock.constants";
import { StorageErrorKind } from "@/enums/storage.enum";
import { useAuth } from "@/hooks/use-auth";
import { useBiometricAvailable } from "@/hooks/use-biometric-available";
import { isBiometricEnabled } from "@/services/app-lock.service";
import { StorageError } from "@/services/storage.error";
import { unlockWithBiometric, unlockWithPin } from "@/services/unlock.service";
import { formatCountdown } from "@/utils/countdown.utils";
import { errorMessage } from "@/utils/error-message.utils";

const TICK_MS = 1000;

/** The lock screen: PIN entry with wrong-guess feedback and lockout countdown, plus biometrics. */
export function useUnlock() {
  const { unlock, signOut } = useAuth();
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const deviceSupportsBiometric = useBiometricAvailable();
  const prompted = useRef(false);

  const remainingMs = retryAt === null ? 0 : Math.max(0, retryAt - now);
  const lockedOut = remainingMs > 0;
  const biometric = biometricEnabled && deviceSupportsBiometric;

  useEffect(() => {
    if (retryAt === null) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, TICK_MS);
    return () => {
      clearInterval(timer);
    };
  }, [retryAt]);

  useEffect(() => {
    let cancelled = false;
    isBiometricEnabled()
      .then((enabled) => {
        if (!cancelled) setBiometricEnabled(enabled);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  /** A missing vault key or PIN can't be repaired here: start over from sign in. */
  const fail = useCallback(
    (error: unknown) => {
      toast.error(errorMessage(error));
      if (error instanceof StorageError && error.kind === StorageErrorKind.Corrupted) signOut();
    },
    [signOut],
  );

  const submit = async (pin: string) => {
    setPending(true);
    try {
      const result = await unlockWithPin(pin);
      if (result.ok) {
        unlock();
        return;
      }
      setValue("");
      if (result.reason === "locked-out") {
        setWrong(null);
        setNow(Date.now());
        setRetryAt(Date.now() + result.retryAfterMs);
      } else {
        setWrong(wrongPinMessage(result.attemptsLeft));
      }
    } catch (error) {
      setValue("");
      fail(error);
    } finally {
      setPending(false);
    }
  };

  const onChange = (next: string) => {
    if (pending || lockedOut) return;
    setValue(next);
    setWrong(null);
    if (next.length === PIN_LENGTH) void submit(next);
  };

  const unlockBiometric = useCallback(async () => {
    try {
      if (await unlockWithBiometric()) unlock();
    } catch (error) {
      fail(error);
    }
  }, [unlock, fail]);

  // Offer the biometric prompt straight away, once; after that it is the button's job.
  useEffect(() => {
    if (!biometric || prompted.current) return;
    prompted.current = true;
    void unlockBiometric();
  }, [biometric, unlockBiometric]);

  const message = lockedOut ? lockedOutMessage(formatCountdown(remainingMs)) : wrong;

  return { value, onChange, message, pending, lockedOut, biometric, unlockBiometric };
}
