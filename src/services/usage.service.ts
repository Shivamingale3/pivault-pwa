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

/** Marks an item as used now. Returns the updated map. */
export async function recordUse(
  id: string,
  kind: EntryKind,
  at: number = Date.now(),
): Promise<UsageMap> {
  const current = await loadUsage();
  const newest = Object.entries({ ...current, [id]: { kind, at } })
    .sort(([, a], [, b]) => b.at - a.at)
    .slice(0, MAX_USAGE_ITEMS);
  const next = Object.fromEntries(newest);
  await idbPut(StoreName.Auth, RecordId.Usage, next);
  return next;
}

export const clearUsage = () => idbDelete(StoreName.Auth, RecordId.Usage);
