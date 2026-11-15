import { useEffect } from "react";
import { AUTO_LOCK_AFTER_MS } from "@/constants/lock.constants";
import { useAuth } from "@/hooks/use-auth";

/**
 * Locks the app after it has been in the background for `AUTO_LOCK_AFTER_MS`. A timer covers the
 * normal case; the elapsed time is re-checked on return because browsers throttle timers in
 * background tabs.
 */
export function useAutoLock(): void {
  const { lock } = useAuth();

  useEffect(() => {
    let hiddenAt: number | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        timer = setTimeout(lock, AUTO_LOCK_AFTER_MS);
        return;
      }
      clearTimeout(timer);
      const awayFor = hiddenAt === null ? 0 : Date.now() - hiddenAt;
      hiddenAt = null;
      if (awayFor >= AUTO_LOCK_AFTER_MS) lock();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimeout(timer);
    };
  }, [lock]);
}
