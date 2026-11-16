import { describe, expect, it } from "vitest";
import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbPut } from "@/db/idb";
import { EntryKind } from "@/enums/vault.enum";
import { MAX_USAGE_ITEMS, clearUsage, loadUsage, recordUse } from "@/services/usage.service";
import { freshIndexedDbPerTest } from "@/test/indexed-db";
import { newId } from "@/utils/id.utils";

freshIndexedDbPerTest();

describe("usage", () => {
  it("starts empty, remembers when an item was used, and forgets on request", async () => {
    expect(await loadUsage()).toEqual({});
    const id = newId();
    await recordUse(id, EntryKind.Password, 5_000);
    expect(await loadUsage()).toEqual({ [id]: { kind: "password", at: 5_000 } });
    await recordUse(id, EntryKind.Password, 9_000);
    expect((await loadUsage())[id]?.at).toBe(9_000);
    await clearUsage();
    expect(await loadUsage()).toEqual({});
  });

  it("keeps only the most recent items", async () => {
    const ids = Array.from({ length: MAX_USAGE_ITEMS + 5 }, () => newId());
    for (const [index, id] of ids.entries()) await recordUse(id, EntryKind.Note, index + 1);
    const usage = await loadUsage();
    expect(Object.keys(usage)).toHaveLength(MAX_USAGE_ITEMS);
    expect(usage[ids[0] ?? ""]).toBeUndefined();
    expect(usage[ids.at(-1) ?? ""]?.at).toBe(ids.length);
  });

  it("stores no titles or secrets, only ids, kinds and times", async () => {
    await recordUse(newId(), EntryKind.Password, 1);
    const raw = JSON.stringify(await loadUsage());
    expect(raw).toMatch(/^\{"[0-9A-Z]{26}":\{"kind":"password","at":1\}\}$/);
  });

  it("starts over when the saved record is damaged", async () => {
    await idbPut(StoreName.Auth, RecordId.Usage, { nonsense: 1 });
    expect(await loadUsage()).toEqual({});
  });
});
