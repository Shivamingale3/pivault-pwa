import { BehaviorSubject, type Observable } from "rxjs";
import { z } from "zod";
import { PULL_BATCH_SIZE } from "@/constants/sync.constants";
import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbDelete, idbGet, idbPut } from "@/db/idb";
import type { SyncCheckpoint } from "@/schemas/sync.schema";
import { pullChanges } from "@/services/sync.api";

/**
 * Which version of each item the server is known to hold: `id -> updatedAt`. An item is synced
 * when its local `updatedAt` matches (every local edit moves `updatedAt` forward). Ids and times
 * only, like the database itself; nothing the user typed.
 */
export type SyncedState = Readonly<Record<string, number>>;

const schema = z.record(z.string(), z.number().int().nonnegative());
const state$ = new BehaviorSubject<SyncedState>({});
let loaded = false;

/** Writes run in order, so quick pull and push reports can't overwrite each other. */
let queue: Promise<unknown> = Promise.resolve();
const inTurn = <T>(task: () => Promise<T>): Promise<T> => {
  const next = queue.then(task, task);
  queue = next.catch(() => undefined);
  return next;
};

const update = (change: (current: Record<string, number>) => void): Promise<void> =>
  inTurn(async () => {
    const next = { ...state$.value };
    change(next);
    state$.next(next);
    await idbPut(StoreName.Auth, RecordId.SyncedState, next);
  });

/** Reads the saved record once. False when there is none yet (an install from before this existed). */
export async function loadSyncedState(): Promise<boolean> {
  const raw: unknown = await idbGet(StoreName.Auth, RecordId.SyncedState);
  const parsed = schema.safeParse(raw);
  state$.next(parsed.success ? parsed.data : {});
  loaded = true;
  return raw !== undefined && parsed.success;
}

export const watchSyncedState = (): Observable<SyncedState> => state$.asObservable();
export const syncedStateLoaded = (): boolean => loaded;

/** True when the server holds exactly this version of the item. */
export const isSynced = (state: SyncedState, id: string, updatedAt: number): boolean =>
  state[id] === updatedAt;

/** The server holds these versions now (pulled, or a push it accepted). Deleted items are forgotten. */
export const recordServerVersions = (
  documents: readonly { id: string; updatedAt: number; _deleted: boolean }[],
): Promise<void> =>
  documents.length === 0
    ? Promise.resolve()
    : update((current) => {
        for (const doc of documents) {
          if (doc._deleted) Reflect.deleteProperty(current, doc.id);
          // Only ever forward: the server keeps the latest version, and reports can arrive late.
          else current[doc.id] = Math.max(current[doc.id] ?? 0, doc.updatedAt);
        }
      });

/**
 * First run with this feature: the normal sync only pulls what changed since its checkpoint, so
 * the server's versions of older items are read once from the start. Best effort.
 */
export async function seedSyncedState(): Promise<void> {
  let checkpoint: SyncCheckpoint | null = null;
  for (;;) {
    const page = await pullChanges(checkpoint, PULL_BATCH_SIZE);
    await recordServerVersions(page.documents);
    checkpoint = page.checkpoint;
    if (page.remaining === 0 || page.documents.length === 0) break;
  }
  await inTurn(() => idbPut(StoreName.Auth, RecordId.SyncedState, state$.value));
}

export async function clearSyncedState(): Promise<void> {
  state$.next({});
  loaded = false;
  await inTurn(() => idbDelete(StoreName.Auth, RecordId.SyncedState));
}
