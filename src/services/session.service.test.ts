import { describe, expect, it } from "vitest";
import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbPut } from "@/db/idb";
import { StorageErrorKind } from "@/enums/storage.enum";
import { clearSession, loadSession, markSetupDone, saveSession } from "@/services/session.service";
import { freshIndexedDbPerTest } from "@/test/indexed-db";
import { newId } from "@/utils/id.utils";

freshIndexedDbPerTest();

const SESSION = {
  userId: newId(),
  email: "a@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  token: "t".repeat(43),
  expiresAt: "2026-12-15T10:00:00.000Z",
  recoveryKeyConfigured: false,
  setupDone: false,
};

describe("session service", () => {
  it("is empty until saved, then round-trips", async () => {
    await expect(loadSession()).resolves.toBeNull();
    await saveSession(SESSION);
    await expect(loadSession()).resolves.toEqual(SESSION);
  });

  it("marks setup done and clears", async () => {
    await saveSession(SESSION);
    await markSetupDone();
    await expect(loadSession()).resolves.toMatchObject({ setupDone: true });
    await clearSession();
    await expect(loadSession()).resolves.toBeNull();
  });

  it("can't mark setup done without a session", async () => {
    await expect(markSetupDone()).rejects.toMatchObject({ kind: StorageErrorKind.Corrupted });
  });

  it("reports a malformed record as corrupted and removes it", async () => {
    await idbPut(StoreName.Auth, RecordId.Session, { email: 1 });
    await expect(loadSession()).rejects.toMatchObject({ kind: StorageErrorKind.Corrupted });
    await expect(loadSession()).resolves.toBeNull();
  });

  it("refuses to save a malformed session", () => {
    expect(() => saveSession({ ...SESSION, userId: "" })).toThrow();
  });
});
