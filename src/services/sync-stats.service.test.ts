import { describe, expect, it } from "vitest";
import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbPut } from "@/db/idb";
import {
  EMPTY_STATS,
  clearSyncStats,
  loadSyncStats,
  recordReceived,
  recordSent,
  recordSynced,
} from "@/services/sync-stats.service";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

freshIndexedDbPerTest();

describe("sync stats", () => {
  it("starts empty", async () => {
    await expect(loadSyncStats()).resolves.toEqual(EMPTY_STATS);
  });

  it("adds up what was sent and received, and remembers the last sync", async () => {
    await recordSent({ created: 2, updated: 0, deleted: 1 });
    await recordSent({ created: 1, updated: 3, deleted: 0 });
    await recordReceived({ created: 0, updated: 1, deleted: 0 });
    await recordSynced(1_700_000_000_000);
    expect(await loadSyncStats()).toEqual({
      sent: { created: 3, updated: 3, deleted: 1 },
      received: { created: 0, updated: 1, deleted: 0 },
      lastSyncedAt: 1_700_000_000_000,
    });
  });

  it("loses no update when several arrive at once", async () => {
    await Promise.all(
      Array.from({ length: 20 }, () => recordSent({ created: 1, updated: 0, deleted: 0 })),
    );
    expect((await loadSyncStats()).sent.created).toBe(20);
  });

  it("starts over instead of failing when the saved record is damaged", async () => {
    await idbPut(StoreName.Auth, RecordId.SyncStats, { sent: "nope" });
    await expect(loadSyncStats()).resolves.toEqual(EMPTY_STATS);
  });

  it("can be cleared", async () => {
    await recordSent({ created: 1, updated: 0, deleted: 0 });
    await clearSyncStats();
    await expect(loadSyncStats()).resolves.toEqual(EMPTY_STATS);
  });
});
