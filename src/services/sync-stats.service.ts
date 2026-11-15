import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbDelete, idbGet, idbPut } from "@/db/idb";
import { type SyncCounts, type SyncStats, syncStatsSchema } from "@/schemas/sync.schema";

const NONE: SyncCounts = { created: 0, updated: 0, deleted: 0 };
export const EMPTY_STATS: SyncStats = { sent: NONE, received: NONE, lastSyncedAt: null };

const add = (a: SyncCounts, b: SyncCounts): SyncCounts => ({
  created: a.created + b.created,
  updated: a.updated + b.updated,
  deleted: a.deleted + b.deleted,
});

/** Totals since sign in (or the first sync). A damaged record starts over rather than blocking sync. */
export async function loadSyncStats(): Promise<SyncStats> {
  const parsed = syncStatsSchema.safeParse(await idbGet(StoreName.Auth, RecordId.SyncStats));
  return parsed.success ? parsed.data : EMPTY_STATS;
}

/** Updates run one at a time, so two quick updates can't overwrite each other. */
let queue: Promise<unknown> = Promise.resolve();
const update = (change: (current: SyncStats) => SyncStats): Promise<SyncStats> => {
  const next = queue.then(async () => {
    const changed = change(await loadSyncStats());
    await idbPut(StoreName.Auth, RecordId.SyncStats, changed);
    return changed;
  });
  queue = next.catch(() => undefined);
  return next;
};

export const recordSent = (counts: SyncCounts) =>
  update((stats) => ({ ...stats, sent: add(stats.sent, counts) }));

export const recordReceived = (counts: SyncCounts) =>
  update((stats) => ({ ...stats, received: add(stats.received, counts) }));

export const recordSynced = (at: number) => update((stats) => ({ ...stats, lastSyncedAt: at }));

export const clearSyncStats = () => idbDelete(StoreName.Auth, RecordId.SyncStats);
