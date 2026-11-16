import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbDelete, idbGet, idbPut } from "@/db/idb";
import type { EntryKind } from "@/enums/vault.enum";
import { type UsageMap, usageSchema } from "@/schemas/usage.schema";

/** Only the most recent items are remembered. */
export const MAX_USAGE_ITEMS = 100;

/** An unreadable record starts over: this is a convenience, never worth blocking the app. */
export async function loadUsage(): Promise<UsageMap> {
  const parsed = usageSchema.safeParse(await idbGet(StoreName.Auth, RecordId.Usage));
  return parsed.success ? parsed.data : {};
}

/** Writes run one at a time: two quick touches, or a touch racing Clear, can't overwrite each other. */
let queue: Promise<unknown> = Promise.resolve();
const inTurn = <T>(task: () => Promise<T>): Promise<T> => {
  const next = queue.then(task, task);
  queue = next.catch(() => undefined);
  return next;
};

/** Marks an item as used now. Returns the updated map. */
export const recordUse = (
  id: string,
  kind: EntryKind,
  at: number = Date.now(),
): Promise<UsageMap> =>
  inTurn(async () => {
    const current = await loadUsage();
    const newest = Object.entries({ ...current, [id]: { kind, at } })
      .sort(([, a], [, b]) => b.at - a.at)
      .slice(0, MAX_USAGE_ITEMS);
    const next = Object.fromEntries(newest);
    await idbPut(StoreName.Auth, RecordId.Usage, next);
    return next;
  });

export const clearUsage = (): Promise<void> =>
  inTurn(() => idbDelete(StoreName.Auth, RecordId.Usage));
