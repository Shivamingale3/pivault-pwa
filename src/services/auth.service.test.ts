import { afterEach, describe, expect, it, vi } from "vitest";
import type * as AppLockConstants from "@/constants/app-lock.constants";

// 600k PBKDF2 rounds per PIN would make these tests crawl.
vi.mock("@/constants/app-lock.constants", async (importOriginal) => ({
  ...(await importOriginal<typeof AppLockConstants>()),
  PBKDF2_ITERATIONS: 1000,
}));
import { ApiErrorKind } from "@/enums/api.enum";
import { AuthStatus } from "@/enums/auth.enum";
import { StorageErrorKind } from "@/enums/storage.enum";
import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbPut } from "@/db/idb";
import { ApiError } from "@/services/api.error";
import {
  login,
  requestPasswordReset,
  resolveStoredStatus,
  signOut,
  markRecoveryKeyConfigured,
} from "@/services/auth.service";
import { getVaultDb } from "@/db/vault.db";
import { EMPTY_STATS, loadSyncStats, recordSent } from "@/services/sync-stats.service";
import { EntryKind } from "@/enums/vault.enum";
import { addEntry } from "@/services/vault.service";
import { loadLoginKeyPair, loadVaultKey, saveVaultKey } from "@/services/key-store.service";
import { hasPin, setPin } from "@/services/app-lock.service";
import { setUnlockedKey, isUnlocked } from "@/services/secure-memory.service";
import { loadSession, saveSession } from "@/services/session.service";
import { importRecoveryKey, generateRecoveryKey } from "@/services/crypto.service";
import { calledInit, calledUrl } from "@/test/fetch";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

freshIndexedDbPerTest();
afterEach(() => vi.restoreAllMocks());

const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const mockFetch = (response: Response) =>
  vi.spyOn(globalThis, "fetch").mockImplementation(() => Promise.resolve(response.clone()));

const LOGIN_DATA = {
  token: "t".repeat(43),
  expiresAt: "2026-12-15T10:00:00.000Z",
  user: { id: "01JABC", email: "jane@example.com", firstName: "Jane", lastName: "Doe" },
  recoveryKeyConfigured: false,
};
const ok = (data?: unknown) => reply(200, { success: true, message: "ok", data });

describe("login", () => {
  it("sends only the public device key, then keeps the key pair and session on this device", async () => {
    const spy = mockFetch(ok(LOGIN_DATA));
    const session = await login("  jane@example.com ", "Passw0rd!");

    expect(calledUrl(spy)).toContain("/api/auth/login");
    const sent = JSON.parse(calledInit(spy).body as string) as {
      email: string;
      password: string;
      publicKey: string;
    };
    expect(sent).toMatchObject({ email: "jane@example.com", password: "Passw0rd!" });
    expect(Object.keys(sent).sort()).toEqual(["email", "password", "publicKey"]);
    expect(sent.publicKey).toMatch(/^[A-Za-z0-9_-]{50,}$/);

    expect(session).toMatchObject({
      userId: "01JABC",
      setupDone: false,
      recoveryKeyConfigured: false,
    });
    await expect(loadSession()).resolves.toEqual(session);
    const pair = await loadLoginKeyPair();
    expect(pair?.privateKey.extractable).toBe(false);
  });

  it("stores nothing when the server refuses", async () => {
    mockFetch(reply(401, { success: false, message: "Invalid email or password" }));
    await expect(login("jane@example.com", "bad")).rejects.toMatchObject({
      kind: ApiErrorKind.Http,
      status: 401,
      message: "Invalid email or password",
    });
    await expect(loadSession()).resolves.toBeNull();
    await expect(loadLoginKeyPair()).resolves.toBeNull();
  });

  it("stores nothing when the reply has the wrong shape", async () => {
    mockFetch(ok({ token: "x" }));
    await expect(login("jane@example.com", "pw")).rejects.toMatchObject({
      kind: ApiErrorKind.InvalidResponse,
    });
    await expect(loadSession()).resolves.toBeNull();
  });
});

describe("requestPasswordReset", () => {
  it("posts the trimmed email", async () => {
    const spy = mockFetch(ok());
    await expect(requestPasswordReset(" jane@example.com ")).resolves.toBeUndefined();
    expect(calledUrl(spy)).toContain("/api/auth/forgot-password");
    expect(JSON.parse(calledInit(spy).body as string)).toEqual({ email: "jane@example.com" });
  });

  it("surfaces the server's reason, such as an unknown email", async () => {
    mockFetch(reply(404, { success: false, message: "No account found for that email" }));
    await expect(requestPasswordReset("x@example.com")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("markRecoveryKeyConfigured", () => {
  it("tells the server as the signed-in user", async () => {
    const spy = mockFetch(ok(LOGIN_DATA));
    await login("jane@example.com", "pw");
    spy.mockImplementation(() => Promise.resolve(ok()));
    await expect(markRecoveryKeyConfigured()).resolves.toBeUndefined();
    const last = spy.mock.calls.length - 1;
    expect(calledUrl(spy, last)).toContain("/api/auth/recovery-key-configured");
    expect(calledInit(spy, last).headers).toMatchObject({
      Authorization: `Bearer ${LOGIN_DATA.token}`,
    });
  });
});

describe("signOut", () => {
  const setUp = async () => {
    mockFetch(ok(LOGIN_DATA));
    await login("jane@example.com", "pw");
    await setPin("135792");
    await saveVaultKey(await importRecoveryKey(generateRecoveryKey()));
    setUnlockedKey(await importRecoveryKey(generateRecoveryKey()));
    await addEntry({ kind: EntryKind.Note, title: "Wifi", body: "hunter2" });
    await recordSent({ created: 3, updated: 0, deleted: 0 });
  };

  const expectWiped = async () => {
    await expect(loadSession()).resolves.toBeNull();
    await expect(loadLoginKeyPair()).resolves.toBeNull();
    await expect(loadVaultKey()).resolves.toBeNull();
    await expect(hasPin()).resolves.toBe(false);
    expect(isUnlocked()).toBe(false);
    expect(await (await getVaultDb()).entries.find().exec()).toHaveLength(0);
    expect(await loadSyncStats()).toEqual(EMPTY_STATS);
  };

  it("ends the server session, then wipes everything on this device", async () => {
    await setUp();
    const spy = mockFetch(ok());
    await signOut();
    expect(calledUrl(spy, spy.mock.calls.length - 1)).toContain("/api/auth/logout");
    await expectWiped();
  });

  it("a sign in started while the wipe is still running keeps its new session", async () => {
    await setUp();
    mockFetch(ok(LOGIN_DATA));
    const leaving = signOut();
    // Not waited for: the user is back on the login screen and signs in straight away.
    const session = await login("jane@example.com", "pw");
    await leaving;
    await expect(loadSession()).resolves.toMatchObject({ token: session.token });
    await expect(loadLoginKeyPair()).resolves.not.toBeNull();
    await expect(hasPin()).resolves.toBe(false);
  });

  it("still wipes the device when the server can't be reached", async () => {
    await setUp();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    await signOut();
    await expectWiped();
  });
});

describe("resolveStoredStatus", () => {
  const session = {
    userId: "01JABC",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Doe",
    token: "t".repeat(43),
    expiresAt: "2026-12-15T10:00:00.000Z",
    recoveryKeyConfigured: true,
  };

  it("is logged out with no session", async () => {
    await expect(resolveStoredStatus()).resolves.toEqual({ status: AuthStatus.LoggedOut });
  });

  it("needs setup until setup is done, then is locked", async () => {
    await saveSession({ ...session, setupDone: false });
    await expect(resolveStoredStatus()).resolves.toEqual({ status: AuthStatus.NeedsSetup });
    await saveSession({ ...session, setupDone: true });
    await expect(resolveStoredStatus()).resolves.toEqual({ status: AuthStatus.Locked });
  });

  it("treats an expired session as logged out and wipes the device", async () => {
    await saveSession({ ...session, setupDone: true, expiresAt: "2020-01-01T00:00:00.000Z" });
    await setPin("135792");
    await saveVaultKey(await importRecoveryKey(generateRecoveryKey()));

    const result = await resolveStoredStatus();
    expect(result.status).toBe(AuthStatus.LoggedOut);
    expect(result.error).toBe("Your session expired. Sign in again.");
    await expect(loadSession()).resolves.toBeNull();
    await expect(loadVaultKey()).resolves.toBeNull();
    expect(await hasPin()).toBe(false);
  });

  it("falls back to logged out, with a message, when the saved session is unreadable", async () => {
    await idbPut(StoreName.Auth, RecordId.Session, { nonsense: true });
    const result = await resolveStoredStatus();
    expect(result.status).toBe(AuthStatus.LoggedOut);
    expect(result.error).toBeTruthy();
    expect(StorageErrorKind.Corrupted).toBeTruthy();
  });
});
