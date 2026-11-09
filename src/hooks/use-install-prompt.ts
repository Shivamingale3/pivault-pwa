import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PWA_MESSAGES } from "@/constants/pwa.constants";
import type { BeforeInstallPromptEvent, InstallPromptState } from "@/interfaces/pwa.interface";

/** Captures the browser's install prompt so the install screen can trigger it from a button. */
export function useInstallPrompt(): InstallPromptState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      // A prompt can be used once; if dismissed the browser fires a fresh event later.
      setDeferred(null);
      if (outcome === "accepted") setInstalled(true);
    } catch (error) {
      console.error("Install prompt failed.", error);
      setDeferred(null);
      toast.error(PWA_MESSAGES.installError, {
        description: PWA_MESSAGES.installErrorDescription,
      });
    }
  }, [deferred]);

  return { canPrompt: deferred !== null, installed, promptInstall };
}
