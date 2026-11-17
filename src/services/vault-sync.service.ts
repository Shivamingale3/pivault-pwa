import { BehaviorSubject, type Observable, filter, firstValueFrom } from "rxjs";
import { replicateRxCollection } from "rxdb/plugins/replication";
import {
  PULL_BATCH_SIZE,
  PUSH_BATCH_SIZE,
  REPLICATION_ID,
  SYNC_INTERVAL_MS,
  SYNC_NOW_TIMEOUT_MS,
  SYNC_MESSAGES,
  SYNC_RETRY_MS,
} from "@/constants/sync.constants";
import { getVaultDb } from "@/db/vault.db";
import type { SyncState } from "@/interfaces/sync.interface";
import type { SyncCheckpoint } from "@/schemas/sync.schema";
import {
  EMPTY_STATS,
  loadSyncStats,
  recordReceived,
  recordSent,
  recordSynced,
} from "@/services/sync-stats.service";
import { createTransfer } from "@/services/sync-transfer.service";
import { loadSyncedState, seedSyncedState } from "@/services/synced-state.service";
import { isOfflineError, isSessionEnded } from "@/utils/sync-error.utils";
import type { VaultDocument } from "@/types/vault.types";
import { errorMessage } from "@/utils/error-message.utils";

export interface VaultSync {
  state$: Observable<SyncState>;
  /** Syncs right now and resolves once this device and the server agree (or an error stops it). */
  syncNow: () => Promise<void>;
  /** Stops syncing and releases listeners. Local data stays. */
  stop: () => Promise<void>;
}

/**
 * Starts RxDB replication between the local vault and the server: pull new changes, push local
 * ones, retry when offline, re-check every 30 seconds and when the app comes back. Only encrypted
 * envelopes cross the wire; the server can't read them.
 */
export async function startVaultSync({
  retryMs = SYNC_RETRY_MS,
}: { retryMs?: number } = {}): Promise<VaultSync> {
  const database = await getVaultDb();
  const collection = database.entries;
  // Per-item "synced" marks. An install from before they existed reads the server's versions once.
  const hasSyncedState = await loadSyncedState().catch(() => true);
  if (!hasSyncedState) void seedSyncedState().catch(() => undefined);
  const state$ = new BehaviorSubject<SyncState>({
    status: navigator.onLine ? "syncing" : "offline",
    progress: null,
    error: null,
    stats: await loadSyncStats().catch(() => EMPTY_STATS),
  });
  const set = (patch: Partial<SyncState>) => {
    if (state$.value.status !== "ended") state$.next({ ...state$.value, ...patch });
  };

  let failed = false;
  /** `failed` can change while an `await` is pending; reading it here keeps the check honest. */
  const hasFailed = (): boolean => failed;

  const fail = (error: unknown) => {
    failed = true;
    if (isSessionEnded(error)) set({ status: "ended", error: SYNC_MESSAGES.ended });
    else if (isOfflineError(error)) set({ status: "offline", error: null });
    else set({ status: "error", error: errorMessage(error) });
  };

  /** Runs a replication step; any failure is classified for the UI and then retried by RxDB. */
  const guarded = async <T>(step: () => Promise<T>): Promise<T> => {
    try {
      const result = await step();
      failed = false;
      return result;
    } catch (error) {
      fail(error);
      throw error;
    }
  };

  let pulledSoFar = 0;
  const transfer = createTransfer(collection, {
    page: ({ documents, remaining }) => {
      pulledSoFar += documents;
      set({ progress: { pulled: pulledSoFar, total: pulledSoFar + remaining } });
    },
    received: async (counts) => {
      set({ stats: await recordReceived(counts) });
    },
    sent: async (counts) => {
      set({ stats: await recordSent(counts) });
    },
  });

  const replication = replicateRxCollection<VaultDocument, SyncCheckpoint>({
    replicationIdentifier: REPLICATION_ID,
    collection,
    live: true,
    retryTime: retryMs,
    pull: {
      batchSize: PULL_BATCH_SIZE,
      handler: (checkpoint, batchSize) => guarded(() => transfer.pull(checkpoint, batchSize)),
    },
    push: {
      batchSize: PUSH_BATCH_SIZE,
      handler: (rows) => guarded(() => transfer.push(rows)),
    },
  });

  /** Everything is up to date: remember when, and tell the UI. */
  const markSynced = async () => {
    if (hasFailed() || state$.value.status === "ended") return;
    const stats = await recordSynced(Date.now());
    pulledSoFar = 0;
    if (!hasFailed()) set({ status: "synced", error: null, progress: null, stats });
  };

  // Errors from our own handlers are already classified; this catches anything else (e.g. storage).
  replication.error$.subscribe((error) => {
    if (!failed) fail(error);
  });

  let started = false;
  replication.active$.subscribe((active) => {
    if (active) {
      started = true;
      if (!failed) set({ status: "syncing" });
    } else if (started) {
      void markSynced();
    }
  });

  const syncNow = async (): Promise<void> => {
    if (state$.value.status === "ended") return;
    failed = false;
    set({ status: navigator.onLine ? "syncing" : "offline", error: null });
    // Done when RxDB says both sides agree, or as soon as a failure is classified (offline, error,
    // ended). The backstop keeps it from hanging; syncing carries on in the background.
    const failure = firstValueFrom(
      state$.pipe(filter((current) => current.status !== "syncing" && current.status !== "synced")),
    ).catch(() => undefined);
    replication.reSync();
    let backstop: ReturnType<typeof setTimeout> | undefined;
    await Promise.race([
      replication.awaitInSync().then(markSynced),
      failure,
      new Promise<void>((resolve) => {
        backstop = setTimeout(resolve, SYNC_NOW_TIMEOUT_MS);
      }),
    ]).finally(() => {
      clearTimeout(backstop);
    });
  };

  const onOnline = () => {
    void syncNow();
  };
  const onOffline = () => {
    set({ status: "offline", error: null });
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") void syncNow();
  };
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  document.addEventListener("visibilitychange", onVisible);
  const timer = setInterval(() => {
    if (state$.value.status !== "ended") replication.reSync();
  }, SYNC_INTERVAL_MS);

  return {
    state$: state$.asObservable(),
    syncNow,
    stop: async () => {
      clearInterval(timer);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
      await replication.cancel();
      state$.complete();
    },
  };
}
