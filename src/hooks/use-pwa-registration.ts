import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";
import { PWA_MESSAGES, SW_UPDATE_INTERVAL_MS } from "@/constants/pwa.constants";

/** Asks the browser for a newer service worker, unless offline or one is already installing. */
export const checkForUpdate = async (registration: ServiceWorkerRegistration) => {
  if (!navigator.onLine || registration.installing) return;
  try {
    await registration.update();
  } catch (error) {
    // A failed check (e.g. server unreachable) is harmless: the next interval retries.
    console.warn("Service worker update check failed.", error);
  }
};

/**
 * Registers the service worker (auto-update: new deploys take over and reload on their own),
 * tells the user once when offline use is ready, and checks for updates hourly.
 */
export function usePwaRegistration() {
  const intervalRef = useRef<number | undefined>(undefined);

  useRegisterSW({
    onOfflineReady() {
      toast.success(PWA_MESSAGES.offlineReady, {
        description: PWA_MESSAGES.offlineReadyDescription,
      });
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        void checkForUpdate(registration);
      }, SW_UPDATE_INTERVAL_MS);
    },
    onRegisterError(error: unknown) {
      console.error("Service worker registration failed.", error);
      toast.error(PWA_MESSAGES.registerError, {
        description: PWA_MESSAGES.registerErrorDescription,
      });
    },
  });

  useEffect(
    () => () => {
      window.clearInterval(intervalRef.current);
    },
    [],
  );
}
