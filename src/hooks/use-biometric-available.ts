import { useEffect, useState } from "react";
import { isBiometricAvailable } from "@/services/biometric.service";

/** Whether this device can offer biometric unlock (checked once, false until known). */
export function useBiometricAvailable(): boolean {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void isBiometricAvailable().then((result) => {
      if (!cancelled) setAvailable(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return available;
}
