import { firstValueFrom } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ENTRY_AAD_PREFIX } from "@/constants/vault.constants";
import { ApiErrorKind } from "@/enums/api.enum";
import { EntryKind } from "@/enums/vault.enum";
import type { SyncDocument } from "@/schemas/sync.schema";
import type { EntryInput } from "@/schemas/vault.schema";
import { ApiError } from "@/services/api.error";
import { encryptJson, generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { clearUnlockedKey, setUnlockedKey } from "@/services/secure-memory.service";
import * as api from "@/services/sync.api";
import { type VaultSync, startVaultSync } from "@/services/vault-sync.service";
import { addEntry, editEntry, removeEntry, watchEntries } from "@/services/vault.service";
import { FakeVaultServer } from "@/test/fake-vault-server";
import { freshIndexedDbPerTest } from "@/test/indexed-db";
import { newId } from "@/utils/id.utils";

freshIndexedDbPerTest();

const NOTE: EntryInput = { kind: EntryKind.Note, title: "Wifi", body: "router: hunter2" };

let server: FakeVaultServer;
let key: CryptoKey;
let sync: VaultSync | null;
let online: boolean;

const start = async () => {
  sync = await startVaultSync({ retryMs: 20 });
  return sync;
};
const running = (): VaultSync => {
  if (!sync) throw new Error("sync has not been started");
  return sync;
};
const state = async () => firstValueFrom(running().state$);
const entries = async () => (await firstValueFrom(watchEntries())).entries;
const synced = async () => {
  await running().syncNow();
};

/** An entry made on another device: sealed with the same key, bound to its id. */
const fromOtherDevice = async (
  payload: EntryInput,
  updatedAt = Date.now(),
  id = newId(),
  deleted = false,
): Promise<SyncDocument> => ({
  id,
  updatedAt,
  _deleted: deleted,
  envelope: await encryptJson(key, payload, `${ENTRY_AAD_PREFIX}${id}`),
});

beforeEach(async () => {
  server = new FakeVaultServer();
  online = true;
  sync = null;
  key = await importRecoveryKey(generateRecoveryKey());
  setUnlockedKey(key);
  vi.spyOn(api, "pullChanges").mockImplementation((checkpoint, limit) =>
    online ? Promise.resolve(server.pull(checkpoint, limit)) : Promise.reject(offline()),
  );
  vi.spyOn(api, "pushChanges").mockImplementation((rows) =>
    online ? Promise.resolve(server.push(rows)) : Promise.reject(offline()),
  );
});
afterEach(async () => {
  await sync?.stop();
  clearUnlockedKey();
  vi.restoreAllMocks();
});

const offline = () => new ApiError(ApiErrorKind.Network, "Can't reach PiVault.");

describe("sending local changes", () => {
  it("pushes a new entry as an encrypted blob and counts it", async () => {
    await start();
    const entry = await addEntry(NOTE);
    await synced();

    const stored = server.entries.get(entry.id);
    expect(stored).toBeDefined();
    expect(Object.keys(stored ?? {}).sort()).toEqual([
      "_deleted",
      "envelope",
      "id",
      "seq",
      "updatedAt",
    ]);
    expect(JSON.stringify(stored)).not.toMatch(/Wifi|hunter2|note/);

    const current = await state();
    expect(current.status).toBe("synced");
    expect(current.stats.sent).toEqual({ created: 1, updated: 0, deleted: 0 });
    expect(current.stats.lastSyncedAt).not.toBeNull();
  });

  it("pushes an edit as an update, and a delete as a tombstone", async () => {
    await start();
    const entry = await addEntry(NOTE);
    await synced();
    await editEntry(entry.id, { ...NOTE, body: "changed" });
    await synced();
    await removeEntry(entry.id);
    await synced();

    expect(server.entries.get(entry.id)?._deleted).toBe(true);
    expect((await state()).stats.sent).toEqual({ created: 1, updated: 1, deleted: 1 });
  });

  it("does not count its own pushes as changes received back", async () => {
    await start();
    await addEntry(NOTE);
    await synced();
    await synced();
    expect((await state()).stats.received).toEqual({ created: 0, updated: 0, deleted: 0 });
  });

  it("pushes what was written before sync started", async () => {
    const entry = await addEntry(NOTE);
    await start();
    await synced();
    expect(server.entries.has(entry.id)).toBe(true);
  });
});

describe("receiving changes", () => {
  it("brings in entries made on another device, decrypted with the same key", async () => {
    server.put(await fromOtherDevice({ ...NOTE, title: "From phone" }));
    await start();
    await synced();

    expect((await entries()).map((entry) => entry.title)).toEqual(["From phone"]);
    expect((await state()).stats.received).toEqual({ created: 1, updated: 0, deleted: 0 });
  });

  it("applies an update and a delete from another device", async () => {
    const id = newId();
    server.put(await fromOtherDevice(NOTE, 1_000, id));
    await start();
    await synced();

    server.put(await fromOtherDevice({ ...NOTE, body: "edited elsewhere" }, 2_000, id));
    await synced();
    expect((await entries())[0]).toMatchObject({ body: "edited elsewhere" });

    server.put(await fromOtherDevice(NOTE, 3_000, id, true));
    await synced();
    expect(await entries()).toEqual([]);
    expect((await state()).stats.received).toEqual({ created: 1, updated: 1, deleted: 1 });
  });

  it("pulls in pages", async () => {
    for (let i = 0; i < 120; i += 1)
      server.put(await fromOtherDevice({ ...NOTE, title: `n${String(i)}` }));
    await start();
    await synced();
    expect((await entries()).length).toBe(120);
    expect(server.pulls).toBeGreaterThanOrEqual(3);
  });

  it("resumes where it stopped after a restart, without receiving anything twice", async () => {
    server.put(await fromOtherDevice(NOTE));
    await start();
    await synced();
    await sync?.stop();

    await start();
    await synced();
    expect((await entries()).length).toBe(1);
    expect((await state()).stats.received.created).toBe(1);
  });
});

describe("conflicts", () => {
  it("keeps the server's version when it is newer than the local edit", async () => {
    await start();
    const entry = await addEntry(NOTE);
    await synced();

    server.put(
      await fromOtherDevice({ ...NOTE, body: "newer on server" }, Date.now() + 60_000, entry.id),
    );
    await editEntry(entry.id, { ...NOTE, body: "older local edit" });
    await synced();
    await synced();

    expect((await entries())[0]).toMatchObject({ body: "newer on server" });
  });

  it("sends the local edit when it is newer than the server's version", async () => {
    await start();
    const entry = await addEntry(NOTE);
    await synced();

    server.put(await fromOtherDevice({ ...NOTE, body: "older on server" }, 1_000, entry.id));
    await editEntry(entry.id, { ...NOTE, body: "newer local edit" });
    await synced();
    await synced();

    expect((await entries())[0]).toMatchObject({ body: "newer local edit" });
    const onServer = server.entries.get(entry.id) as SyncDocument;
    expect(onServer.updatedAt).toBeGreaterThan(1_000);
  });
});

describe("going offline", () => {
  it("keeps working locally, says it is offline, and catches up when the connection returns", async () => {
    await start();
    online = false;
    const entry = await addEntry(NOTE);
    await synced().catch(() => undefined);

    expect((await state()).status).toBe("offline");
    expect((await entries()).map((e) => e.id)).toEqual([entry.id]);
    expect(server.entries.size).toBe(0);

    online = true;
    await synced();
    expect(server.entries.has(entry.id)).toBe(true);
    expect((await state()).status).toBe("synced");
  });

  it("reports a server problem as an error and retries", async () => {
    vi.spyOn(api, "pushChanges").mockRejectedValueOnce(
      new ApiError(ApiErrorKind.Http, "Something went wrong. Try again.", 500),
    );
    await start();
    await addEntry(NOTE);
    await synced().catch(() => undefined);
    expect(await state()).toMatchObject({
      status: "error",
      error: "Something went wrong. Try again.",
    });
  });
});

describe("session ended", () => {
  it("stops, says why, and does not hammer the server", async () => {
    vi.spyOn(api, "pullChanges").mockRejectedValue(
      new ApiError(ApiErrorKind.Http, "Not signed in", 401),
    );
    await start();
    await synced().catch(() => undefined);

    expect(await state()).toMatchObject({
      status: "ended",
      error: expect.stringContaining("signed in on another device") as unknown,
    });
    const calls = vi.mocked(api.pullChanges).mock.calls.length;
    await synced();
    expect(vi.mocked(api.pullChanges).mock.calls.length).toBe(calls);
  });
});

describe("stopping", () => {
  it("stops sending changes once stopped, but keeps them on the device", async () => {
    await start();
    await sync?.stop();
    const pushes = server.pushes;
    await addEntry(NOTE);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(server.pushes).toBe(pushes);
    expect(await entries()).toHaveLength(1);
  });
});
