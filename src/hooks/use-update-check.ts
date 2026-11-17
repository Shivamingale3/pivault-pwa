import { useState } from "react";
import { toast } from "sonner";
import { ABOUT_COPY } from "@/constants/settings.constants";

/**
 * Asks the browser for a newer version of the app now (normally it checks every hour). When there
 * is one, the app installs it and reloads by itself; otherwise the user is told they are up to date.
 */
export function useUpdateCheck() {
  const [checking, setChecking] = useState(false);

  const check = async () => {
    if (checking) return;
    if (!navigator.onLine) {
      toast.error(ABOUT_COPY.offline);
      return;
    }
    setChecking(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.update();
      if (registration?.installing ?? registration?.waiting) toast.info(ABOUT_COPY.updating);
      else toast.success(ABOUT_COPY.upToDate);
    } catch {
      toast.error(ABOUT_COPY.offline);
    } finally {
      setChecking(false);
    }
  };

  return { check, checking };
}
