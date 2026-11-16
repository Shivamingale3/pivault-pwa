import { afterEach, describe, expect, it, vi } from "vitest";
import type * as AppLockConstants from "@/constants/app-lock.constants";
import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbGet, idbPut } from "@/db/idb";
import { StorageErrorKind } from "@/enums/storage.enum";
import {
  clearAppLock,
  hasPin,
  isBiometricEnabled,
  getBiometricCredentialId,
  setBiometric,
  setPin,
  verifyPin,
} from "@/services/app-lock.service";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

// 600k PBKDF2 rounds per check would make these tests crawl.
vi.mock("@/constants/app-lock.constants", async (importOriginal) => ({
  ...(await importOriginal<typeof AppLockConstants>()),
  PBKDF2_ITERATIONS: 1000,
}));

freshIndexedDbPerTest();
afterEach(() => vi.restoreAllMocks());

const PIN = "123456";
const miss = async (times: number) => {
  for (let i = 0; i < times; i += 1) await verifyPin("000000");
};

describe("PIN", () => {
  it("is not set until set, and stores only a salted hash", async () => {
    expect(await hasPin()).toBe(false);
    await setPin(PIN);
    expect(await hasPin()).toBe(true);
    expect(JSON.stringify(await idbGet(StoreName.Auth, RecordId.AppLock))).not.toContain(PIN);
  });

  it.each(["12345", "1234567", "12345a", "", "12 456"])("rejects %j", async (pin) => {
    await expect(setPin(pin)).rejects.toThrow(RangeError);
  });

  it("uses a different salt each time", async () => {
    await setPin(PIN);
    const first = await idbGet(StoreName.Auth, RecordId.AppLock);
    await setPin(PIN);
    const second = await idbGet(StoreName.Auth, RecordId.AppLock);
    expect(first).not.toEqual(second);
  });

  it("accepts the right PIN and counts down the wrong ones", async () => {
    await setPin(PIN);
    await expect(verifyPin("111111")).resolves.toEqual({
      ok: false,
      reason: "wrong",
      attemptsLeft: 4,
    });
    await expect(verifyPin("222222")).resolves.toEqual({
      ok: false,
      reason: "wrong",
      attemptsLeft: 3,
    });
    await expect(verifyPin(PIN)).resolves.toEqual({ ok: true });
    await expect(verifyPin("111111")).resolves.toMatchObject({ attemptsLeft: 4 });
  });

  it("locks out after 5 misses, even for the right PIN, until the time passes", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    await setPin(PIN);
    await miss(4);
    await expect(verifyPin("000000")).resolves.toMatchObject({
      ok: false,
      reason: "locked-out",
      retryAfterMs: 30_000,
      attempt: 5,
      attemptsPerRound: 5,
      nextWaitMs: 300_000,
    });
    now.mockReturnValue(1_010_000);
    await expect(verifyPin(PIN)).resolves.toMatchObject({
      ok: false,
      reason: "locked-out",
      retryAfterMs: 20_000,
      attempt: 5,
      attemptsPerRound: 5,
      nextWaitMs: 300_000,
    });
    now.mockReturnValue(1_031_000);
    await expect(verifyPin(PIN)).resolves.toEqual({ ok: true });
  });

  it("can't dodge the counter with parallel guesses", async () => {
    await setPin(PIN);
    const results = await Promise.all(Array.from({ length: 6 }, () => verifyPin("000000")));
    expect(results.filter((r) => !r.ok && r.reason === "locked-out")).toHaveLength(2);
  });

  it("fails clearly when no PIN exists or the record is corrupted", async () => {
    await expect(verifyPin(PIN)).rejects.toMatchObject({ kind: StorageErrorKind.Corrupted });
    await idbPut(StoreName.Auth, RecordId.AppLock, { hash: 5 });
    await expect(hasPin()).rejects.toMatchObject({ kind: StorageErrorKind.Corrupted });
    expect(await hasPin()).toBe(false);
  });

  it("clears", async () => {
    await setPin(PIN);
    await clearAppLock();
    expect(await hasPin()).toBe(false);
  });
});

describe("biometric opt-in", () => {
  it("defaults to off, remembers the credential, and survives a PIN change", async () => {
    expect(await isBiometricEnabled()).toBe(false);
    expect(await getBiometricCredentialId()).toBeNull();
    await setPin(PIN);
    await setBiometric("cred-1");
    expect(await isBiometricEnabled()).toBe(true);
    expect(await getBiometricCredentialId()).toBe("cred-1");
    await setPin("654321");
    expect(await isBiometricEnabled()).toBe(true);
    expect(await getBiometricCredentialId()).toBe("cred-1");
  });

  it("can be turned off again", async () => {
    await setPin(PIN);
    await setBiometric("cred-1");
    await setBiometric(null);
    expect(await isBiometricEnabled()).toBe(false);
    expect(await getBiometricCredentialId()).toBeNull();
  });

  it("needs a PIN first", async () => {
    await expect(setBiometric("cred-1")).rejects.toMatchObject({
      kind: StorageErrorKind.Corrupted,
    });
  });
});
