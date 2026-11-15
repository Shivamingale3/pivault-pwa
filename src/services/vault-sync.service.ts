import { BehaviorSubject, type Observable, filter, firstValueFrom } from "rxjs";
import type { RxCollection } from "rxdb/plugins/core";
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
import { ApiErrorKind } from "@/enums/api.enum";
import type { SyncState } from "@/interfaces/sync.interface";
import type { SyncCheckpoint, SyncCounts, SyncDocument } from "@/schemas/sync.schema";
import { ApiError } from "@/services/api.error";
import {
  EMPTY_STATS,
  loadSyncStats,
  recordReceived,
  recordSent,
  recordSynced,
} from "@/services/sync-stats.service";
import { type PushRow, pullChanges, pushChanges } from "@/services/sync.api";
import type { VaultDocument } from "@/types/vault.types";
import { errorMessage } from "@/utils/error-message.utils";

export interface VaultSync {
  state$: Observable<SyncState>;
  /** Syncs right now and resolves once this device and the server agree (or an error stops it). */
  syncNow: () => Promise<void>;
  /** Stops syncing and releases listeners. Local data stays. */
  stop: () => Promise<void>;
}

const NONE: SyncCounts = { created: 0, updated: 0, deleted: 0 };
const fingerprint = (doc: SyncDocument): string =>
  `${doc.id}:${String(doc.updatedAt)}:${String(doc._deleted)}:${doc.envelope.iv}`;

const isOfflineError = (error: unknown): boolean =>
  !navigator.onLine ||
  (error instanceof ApiError &&
    (error.kind === ApiErrorKind.Network || error.kind === ApiErrorKind.Timeout));

const isSessionEnded = (error: unknown): boolean =>
  error instanceof ApiError && error.kind === ApiErrorKind.Http && error.status === 401;

/** Only these fields leave the device. Everything the user typed is inside the encrypted envelope. */
const toDocument = ({ id, updatedAt, _deleted, envelope }: SyncDocument): SyncDocument => ({
  id,
  updatedAt,
  _deleted,
  envelope: { ...envelope },
});

/** Received entries that are really new, changed or deleted here (not echoes of our own pushes). */
async function countReceived(
  collection: RxCollection<VaultDocument>,
  documents: SyncDocument[],
  echoes: Set<string>,
): Promise<SyncCounts> {
  const fresh = documents.filter((doc) => !echoes.delete(fingerprint(doc)));
  const existing = await collection.findByIds(fresh.map((doc) => doc.id)).exec();
  const counts = { ...NONE };
  for (const doc of fresh) {
    if (doc._deleted) counts.deleted += 1;
    else if (existing.has(doc.id)) counts.updated += 1;
    else counts.created += 1;
  }
  return counts;
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
  const state$ = new BehaviorSubject<SyncState>({
    status: navigator.onLine ? "syncing" : "offline",
    error: null,
    stats: await loadSyncStats().catch(() => EMPTY_STATS),
  });
  const set = (patch: Partial<SyncState>) => {
    if (state$.value.status !== "ended") state$.next({ ...state$.value, ...patch });
  };

  let failed = false;
  /** `failed` can change while an `await` is pending; reading it here keeps the check honest. */
  const hasFailed = (): boolean => failed;
  const echoes = new Set<string>();

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

  const replication = replicateRxCollection<VaultDocument, SyncCheckpoint>({
    replicationIdentifier: REPLICATION_ID,
    collection,
    live: true,
    retryTime: retryMs,
    pull: {
      batchSize: PULL_BATCH_SIZE,
      handler: (checkpoint, batchSize) =>
        guarded(async () => {
          const response = await pullChanges(checkpoint ?? null, batchSize);
          const counts = await countReceived(collection, response.documents, echoes);
          if (counts.created + counts.updated + counts.deleted > 0) {
            set({ stats: await recordReceived(counts) });
          }
          return { documents: response.documents.map(toDocument), checkpoint: response.checkpoint };
        }),
    },
    push: {
      batchSize: PUSH_BATCH_SIZE,
      handler: (rows) =>
        guarded(async () => {
          const body: PushRow[] = rows.map((row) => ({
            assumedMasterState: row.assumedMasterState
              ? toDocument(row.assumedMasterState as SyncDocument)
              : null,
            newDocumentState: toDocument(row.newDocumentState as SyncDocument),
          }));
          const response = await pushChanges(body);
          const lost = new Set(response.conflicts.map((doc) => doc.id));
          for (const row of body) {
            if (!lost.has(row.newDocumentState.id)) echoes.add(fingerprint(row.newDocumentState));
          }
          const { counts } = response;
          if (counts.created + counts.updated + counts.deleted > 0) {
            set({ stats: await recordSent(counts) });
          }
          return response.conflicts.map(toDocument);
        }),
    },
  });

  /** Everything is up to date: remember when, and tell the UI. */
  const markSynced = async () => {
    if (hasFailed() || state$.value.status === "ended") return;
    const stats = await recordSynced(Date.now());
    if (!hasFailed()) set({ status: "synced", error: null, stats });
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
