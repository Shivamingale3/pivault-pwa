import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SyncContext } from "@/contexts/sync.context";
import type { SyncContextValue, SyncState } from "@/interfaces/sync.interface";
import { EMPTY_STATS } from "@/services/sync-stats.service";
import { type VaultSync, startVaultSync } from "@/services/vault-sync.service";
import { errorMessage } from "@/utils/error-message.utils";

const STARTING: SyncState = { status: "syncing", progress: null, error: null, stats: EMPTY_STATS };

/**
 * Runs the sync while the app is unlocked and stops it on lock or sign out. Replication only moves
 * encrypted entries, so it doesn't need the vault key, but it only runs while the user is in.
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SyncState>(STARTING);
  const handle = useRef<VaultSync | null>(null);

  useEffect(() => {
    let cancelled = false;
    let running: VaultSync | null = null;
    let subscription: { unsubscribe: () => void } | null = null;

    startVaultSync()
      .then((started) => {
        if (cancelled) {
          void started.stop();
          return;
        }
        running = started;
        handle.current = started;
        subscription = started.state$.subscribe(setState);
      })
      .catch((error: unknown) => {
        toast.error(errorMessage(error));
        setState({
          status: "error",
          progress: null,
          error: errorMessage(error),
          stats: EMPTY_STATS,
        });
      });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
      handle.current = null;
      void running?.stop();
    };
  }, []);

  // Said once, when the session is gone: the user needs to know why nothing syncs any more.
  const { status, error } = state;
  useEffect(() => {
    if (status === "ended" && error) toast.error(error);
  }, [status, error]);

  const syncNow = useCallback(async () => {
    await handle.current?.syncNow();
  }, []);

  const value = useMemo<SyncContextValue>(() => ({ ...state, syncNow }), [state, syncNow]);

  return <SyncContext value={value}>{children}</SyncContext>;
}
