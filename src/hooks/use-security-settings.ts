import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BIOMETRIC_MESSAGES } from "@/constants/auth.constants";
import { SECURITY_COPY } from "@/constants/settings.constants";
import { useBiometricAvailable } from "@/hooks/use-biometric-available";
import { DEFAULT_PREFERENCES, type Preferences } from "@/schemas/preferences.schema";
import { isBiometricEnabled, setBiometric } from "@/services/app-lock.service";
import { enrollBiometric } from "@/services/biometric.service";
import { loadPreferences, savePreferences } from "@/services/preferences.service";
import { loadSession } from "@/services/session.service";

/** The Security screen: biometric unlock on or off, and the lock and clipboard timeouts. Applies at once. */
export function useSecuritySettings() {
  const faceAvailable = useBiometricAvailable();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [faceOn, setFaceOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([loadPreferences(), isBiometricEnabled().catch(() => false)]).then(
      ([loaded, enabled]) => {
        if (cancelled) return;
        setPreferences(loaded);
        setFaceOn(enabled);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const change = (patch: Partial<Preferences>) => {
    const before = preferences;
    setPreferences({ ...preferences, ...patch });
    savePreferences(patch).catch(() => {
      setPreferences(before);
      toast.error(SECURITY_COPY.saveFailed);
    });
  };

  /** Turning it on asks the device to enroll (the user confirms with their face or finger). */
  const toggleFace = async (on: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      if (on) {
        const session = await loadSession();
        if (!session) throw new Error("No session");
        await setBiometric(await enrollBiometric(session));
      } else {
        await setBiometric(null);
      }
      setFaceOn(on);
    } catch {
      toast.error(BIOMETRIC_MESSAGES.failed);
    } finally {
      setBusy(false);
    }
  };

  return { preferences, change, faceAvailable, faceOn, toggleFace, busy };
}
