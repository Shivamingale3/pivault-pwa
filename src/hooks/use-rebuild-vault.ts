import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { API_ERROR_MESSAGES } from "@/constants/api.constants";
import { SETUP_COPY } from "@/constants/setup.constants";
import type { SyncProgress, SyncStatus } from "@/interfaces/sync.interface";
import { ROUTES } from "@/routes/route-paths";
import { type VaultSync, startVaultSync } from "@/services/vault-sync.service";
import { errorMessage } from "@/utils/error-message.utils";

const DONE_PAUSE_MS = 700;

export type RebuildStatus = "running" | "done" | "failed";

/** The sync's status as a rebuild outcome, or null while it is still working. */
function outcome(status: SyncStatus): RebuildStatus | null {
  if (status === "synced") return "done";
  if (status === "syncing") return null;
  return "failed";
}

/**
 * Pulls the whole vault down with the real sync (so there is one replication path, not two) and
 * reports how far it has got. When the first sync completes the sync is stopped (the app starts it
 * again once unlocked) and setup moves on to the PIN. A failure can be retried.
 */
export function useRebuildVault() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<SyncProgress>({ pulled: 0, total: 0 });
  const [status, setStatus] = useState<RebuildStatus>("running");
  const [error, setError] = useState<string | null>(null);
  const handle = useRef<VaultSync | null>(null);

  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;
    let running: VaultSync | null = null;

    startVaultSync()
      .then((started) => {
        if (cancelled) {
          void started.stop();
          return;
        }
        running = started;
        handle.current = started;
        subscription = started.state$.subscribe((state) => {
          if (state.progress) setProgress(state.progress);
          const next = outcome(state.status);
          if (next === "done") {
            setStatus("done");
            setError(null);
          } else if (next === "failed") {
            setStatus("failed");
            setError(
              state.error ??
                (state.status === "offline"
                  ? API_ERROR_MESSAGES.network
                  : SETUP_COPY.recoveringFailed),
            );
          }
        });
      })
      .catch((caught: unknown) => {
        setStatus("failed");
        setError(errorMessage(caught));
      });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
      handle.current = null;
      void running?.stop();
    };
  }, []);

  useEffect(() => {
    if (status !== "done") return;
    const timer = setTimeout(() => {
      void navigate(ROUTES.setupAppLock, { replace: true });
    }, DONE_PAUSE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [status, navigate]);

  const retry = useCallback(() => {
    setStatus("running");
    setError(null);
    void handle.current?.syncNow();
  }, []);

  const percent =
    status === "done" ? 100 : progress.total === 0 ? 0 : (progress.pulled / progress.total) * 100;
  return { progress, status, error, percent, retry };
}
