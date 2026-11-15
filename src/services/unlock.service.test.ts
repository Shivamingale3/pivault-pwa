import { afterEach, describe, expect, it, vi } from "vitest";
import type * as AppLockConstants from "@/constants/app-lock.constants";
import { LOCK_MESSAGES } from "@/constants/lock.constants";
import { StorageErrorKind } from "@/enums/storage.enum";
import { setBiometric, setPin } from "@/services/app-lock.service";
import * as biometric from "@/services/biometric.service";
import { generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { saveVaultKey } from "@/services/key-store.service";
import { clearUnlockedKey, isUnlocked } from "@/services/secure-memory.service";
import { unlockWithBiometric, unlockWithPin } from "@/services/unlock.service";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

vi.mock("@/constants/app-lock.constants", async (importOriginal) => ({
  ...(await importOriginal<typeof AppLockConstants>()),
  PBKDF2_ITERATIONS: 1000,
}));

freshIndexedDbPerTest();
afterEach(() => {
  vi.restoreAllMocks();
  clearUnlockedKey();
});

const PIN = "135792";
const setUp = async () => {
  await setPin(PIN);
  await saveVaultKey(await importRecoveryKey(generateRecoveryKey()));
};

describe("unlockWithPin", () => {
  it("puts the vault key in memory for the right PIN", async () => {
    await setUp();
    await expect(unlockWithPin(PIN)).resolves.toEqual({ ok: true });
    expect(isUnlocked()).toBe(true);
  });

  it("stays locked for a wrong PIN", async () => {
    await setUp();
    await expect(unlockWithPin("246801")).resolves.toEqual({
      ok: false,
      reason: "wrong",
      attemptsLeft: 4,
    });
    expect(isUnlocked()).toBe(false);
  });

  it("can't unlock without a saved vault key, even with the right PIN", async () => {
    await setPin(PIN);
    await expect(unlockWithPin(PIN)).rejects.toMatchObject({
      kind: StorageErrorKind.Corrupted,
      message: LOCK_MESSAGES.vaultKeyMissing,
    });
    expect(isUnlocked()).toBe(false);
  });
});

describe("unlockWithBiometric", () => {
  it("is false when biometrics were never enrolled", async () => {
    await setUp();
    const verify = vi.spyOn(biometric, "verifyBiometric");
    await expect(unlockWithBiometric()).resolves.toBe(false);
    expect(verify).not.toHaveBeenCalled();
  });

  it("unlocks when the device confirms the user", async () => {
    await setUp();
    await setBiometric("cred-1");
    const verify = vi.spyOn(biometric, "verifyBiometric").mockResolvedValue(true);
    await expect(unlockWithBiometric()).resolves.toBe(true);
    expect(verify).toHaveBeenCalledWith("cred-1");
    expect(isUnlocked()).toBe(true);
  });

  it("stays locked when the user cancels", async () => {
    await setUp();
    await setBiometric("cred-1");
    vi.spyOn(biometric, "verifyBiometric").mockResolvedValue(false);
    await expect(unlockWithBiometric()).resolves.toBe(false);
    expect(isUnlocked()).toBe(false);
  });
});
