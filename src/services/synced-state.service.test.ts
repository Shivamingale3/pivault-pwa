import { firstValueFrom } from "rxjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as syncApi from "@/services/sync.api";
import {
  clearSyncedState,
  isSynced,
  loadSyncedState,
  recordServerVersions,
  seedSyncedState,
  watchSyncedState,
} from "@/services/synced-state.service";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

freshIndexedDbPerTest();
afterEach(async () => {
  await clearSyncedState();
  vi.restoreAllMocks();
});

const doc = (id: string, updatedAt: number, deleted = false) => ({
  id,
  updatedAt,
  _deleted: deleted,
});
const now = () => firstValueFrom(watchSyncedState());

describe("synced state", () => {
  it("marks an item synced only for the version the server holds", async () => {
    await recordServerVersions([doc("a", 10)]);
    const state = await now();
    expect(isSynced(state, "a", 10)).toBe(true);
    expect(isSynced(state, "a", 11)).toBe(false);
    expect(isSynced(state, "b", 10)).toBe(false);
  });

  it("only moves forward, forgets deleted items, and survives a reload", async () => {
    await recordServerVersions([doc("a", 20), doc("b", 5)]);
    await recordServerVersions([doc("a", 10), doc("b", 6, true)]);
    expect(await now()).toEqual({ a: 20 });
    expect(await loadSyncedState()).toBe(true);
    expect(await now()).toEqual({ a: 20 });
  });

  it("says when there is no record yet, and reads the server's versions once to seed it", async () => {
    expect(await loadSyncedState()).toBe(false);
    const pull = vi
      .spyOn(syncApi, "pullChanges")
      .mockResolvedValueOnce({
        documents: [{ ...doc("a", 1), envelope: {} as never }],
        checkpoint: { seq: 1 },
        remaining: 1,
      })
      .mockResolvedValueOnce({
        documents: [{ ...doc("b", 2), envelope: {} as never }],
        checkpoint: { seq: 2 },
        remaining: 0,
      });
    await seedSyncedState();
    expect(pull).toHaveBeenCalledTimes(2);
    expect(pull.mock.calls[1]?.[0]).toEqual({ seq: 1 });
    expect(await now()).toEqual({ a: 1, b: 2 });
    expect(await loadSyncedState()).toBe(true);
  });

  it("is wiped on clear", async () => {
    await recordServerVersions([doc("a", 1)]);
    await clearSyncedState();
    expect(await now()).toEqual({});
    expect(await loadSyncedState()).toBe(false);
  });
});
