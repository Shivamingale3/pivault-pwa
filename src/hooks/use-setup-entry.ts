import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/routes/route-paths";
import { hasPin } from "@/services/app-lock.service";
import { loadVaultKey } from "@/services/key-store.service";
import { loadSession } from "@/services/session.service";
import { finishRecoveredSetup } from "@/services/setup.service";
import { errorMessage } from "@/utils/error-message.utils";

/**
 * Where setup continues after a sign in (or a reload part-way through). First time on this account:
 * PIN, then recovery key. New phone: recovery key, rebuild, then PIN. Returns the route to go to,
 * or null while it works it out (or when it finished setup itself).
 */
export function useSetupEntry(): string | null {
  const { completeSetup } = useAuth();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    /** `cancelled` flips in the cleanup while the awaits below are pending. */
    const stopped = (): boolean => cancelled;
    void (async () => {
      try {
        const session = await loadSession();
        const [pin, key] = [await hasPin(), (await loadVaultKey()) !== null];
        let next: string | null;
        if (!session?.recoveryKeyConfigured) {
          next = pin ? ROUTES.setupRecoveryKey : ROUTES.setupAppLock;
        } else if (!key) {
          next = ROUTES.setupRecover;
        } else if (!pin) {
          next = ROUTES.setupRecovering;
        } else {
          await finishRecoveredSetup();
          if (!stopped()) completeSetup();
          return;
        }
        if (!stopped()) setTarget(next);
      } catch (error) {
        toast.error(errorMessage(error));
        if (!stopped()) setTarget(ROUTES.setupAppLock);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [completeSetup]);

  return target;
}
