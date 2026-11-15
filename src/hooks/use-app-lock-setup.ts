import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { BIOMETRIC_MESSAGES } from "@/constants/auth.constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useBiometricAvailable } from "@/hooks/use-biometric-available";
import { usePinSetup } from "@/hooks/use-pin-setup";
import { ROUTES } from "@/routes/route-paths";
import { hasPin } from "@/services/app-lock.service";
import { configureAppLock } from "@/services/setup.service";

/** The app lock step: PIN entry, the biometric choice, and saving both. */
export function useAppLockSetup() {
  const navigate = useNavigate();
  const pin = usePinSetup();
  const request = useAuthRequest();
  const biometricAvailable = useBiometricAvailable();
  const [biometric, setBiometric] = useState(false);

  // A PIN saved before a reload or an interrupted setup: carry on with the next step.
  useEffect(() => {
    let cancelled = false;
    hasPin()
      .then((exists) => {
        if (!cancelled && exists) void navigate(ROUTES.setupRecoveryKey, { replace: true });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const submit = async () => {
    if (!pin.pin || request.pending) return;
    const chosen = pin.pin;
    const result = await request.run(() => configureAppLock(chosen, biometric));
    if (!result) return;
    if (result.biometricFailed) toast.error(BIOMETRIC_MESSAGES.failed);
    void navigate(ROUTES.setupRecoveryKey, { replace: true });
  };

  return {
    pin,
    biometricAvailable,
    biometric,
    setBiometric,
    pending: request.pending,
    error: request.error,
    submit,
  };
}
