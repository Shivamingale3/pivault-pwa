import { useEffect } from "react";
import { currentPreferences } from "@/services/preferences.service";
import { useAuth } from "@/hooks/use-auth";

/**
 * Locks the app after it has been in the background for the time chosen in Security. A timer covers the
 * normal case; the elapsed time is re-checked on return because browsers throttle timers in
 * background tabs.
 */
/** The user's choice in Security, read when it is needed so a change applies at once. */
const after = (): number => currentPreferences().autoLockMs;

export function useAutoLock(): void {
  const { lock } = useAuth();

  useEffect(() => {
    let hiddenAt: number | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        // "Instantly" locks as the app leaves the screen.
        if (after() === 0) lock();
        else timer = setTimeout(lock, after());
        return;
      }
      clearTimeout(timer);
      const awayFor = hiddenAt === null ? 0 : Date.now() - hiddenAt;
      hiddenAt = null;
      if (awayFor >= after()) lock();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimeout(timer);
    };
  }, [lock]);
}
