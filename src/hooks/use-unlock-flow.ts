import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FACE_FAILED_SCREEN_AT, FACE_TRIES, wrongPinMessage } from "@/constants/lock.constants";
import { StorageErrorKind } from "@/enums/storage.enum";
import { useAuth } from "@/hooks/use-auth";
import { useBiometricAvailable } from "@/hooks/use-biometric-available";
import { useCountdown } from "@/hooks/use-countdown";
import { usePinEntry } from "@/hooks/use-pin-entry";
import { useSession } from "@/hooks/use-session";
import type { PinLock } from "@/interfaces/app-lock.interface";
import { isBiometricEnabled } from "@/services/app-lock.service";
import { StorageError } from "@/services/storage.error";
import { unlockWithBiometric, unlockWithPin } from "@/services/unlock.service";
import { errorMessage } from "@/utils/error-message.utils";

export type UnlockStage = "face" | "face-failed" | "pin" | "lockout";

/**
 * The lock screen as one state machine. With biometrics on, Face ID is the way in and the PIN
 * takes over after three failures (or when asked for); otherwise it is the PIN straight away. Five
 * wrong PINs start a growing wait. The vault key is loaded by the service; the app only opens
 * after the "Unlocked" confirmation.
 */
export function useUnlockFlow() {
  const { unlock, signOut } = useAuth();
  const session = useSession();
  const deviceCanScan = useBiometricAvailable();
  const [biometricOn, setBiometricOn] = useState<boolean | null>(null);
  const [pinChosen, setPinChosen] = useState(false);
  const [faceFailures, setFaceFailures] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const [lock, setLock] = useState<(PinLock & { endsAt: number }) | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const prompted = useRef(false);

  const remainingMs = useCountdown(lock?.endsAt ?? null, () => {
    setLock(null);
  });
  const lockedOut = lock !== null && remainingMs > 0;

  useEffect(() => {
    let cancelled = false;
    isBiometricEnabled()
      .then((enabled) => {
        if (!cancelled) setBiometricOn(enabled);
      })
      .catch(() => {
        if (!cancelled) setBiometricOn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const faceAvailable = biometricOn === true && deviceCanScan;

  let stage: UnlockStage = "pin";
  if (lockedOut) stage = "lockout";
  else if (faceAvailable && !pinChosen && faceFailures < FACE_TRIES) {
    stage = faceFailures >= FACE_FAILED_SCREEN_AT ? "face-failed" : "face";
  }

  /** A missing vault key or PIN can't be repaired here: start over from sign in. */
  const fail = useCallback(
    (error: unknown) => {
      toast.error(errorMessage(error));
      if (error instanceof StorageError && error.kind === StorageErrorKind.Corrupted) signOut();
    },
    [signOut],
  );

  const scan = useCallback(async () => {
    setScanning(true);
    try {
      if (await unlockWithBiometric()) setUnlocked(true);
      else setFaceFailures((count) => count + 1);
    } catch (error) {
      fail(error);
    } finally {
      setScanning(false);
    }
  }, [fail]);

  // Offer the scan straight away, once. After that it is the user's call (tile or key).
  useEffect(() => {
    if (!faceAvailable || prompted.current) return;
    prompted.current = true;
    void scan();
  }, [faceAvailable, scan]);

  const pin = usePinEntry({
    disabled: checking || lockedOut || unlocked,
    onComplete: (entered) => {
      void (async () => {
        setChecking(true);
        try {
          const result = await unlockWithPin(entered);
          if (result.ok) {
            setUnlocked(true);
          } else if (result.reason === "locked-out") {
            setWrong(null);
            setLock({ ...result, endsAt: Date.now() + result.retryAfterMs });
            pin.shake();
          } else {
            setWrong(wrongPinMessage(result.attemptsLeft));
            pin.shake();
          }
        } catch (error) {
          pin.clear();
          fail(error);
        } finally {
          setChecking(false);
        }
      })();
    },
  });

  return {
    stage,
    firstName: session?.firstName ?? "",
    email: session?.email ?? "",
    pin,
    wrong,
    showPin,
    toggleShowPin: () => {
      setShowPin((current) => !current);
    },
    faceAvailable,
    scanning,
    faceFailures,
    scan,
    usePin: () => {
      setPinChosen(true);
    },
    retryFace: () => {
      setPinChosen(false);
      void scan();
    },
    lock,
    remainingMs,
    unlocked,
    /** Called when the "Unlocked" confirmation has been seen. */
    finish: unlock,
    signOut,
  };
}
