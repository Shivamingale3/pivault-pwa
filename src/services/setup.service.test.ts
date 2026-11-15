import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as AppLockConstants from "@/constants/app-lock.constants";
import { ApiErrorKind } from "@/enums/api.enum";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import { ApiError } from "@/services/api.error";
import { getBiometricCredentialId, hasPin, isBiometricEnabled } from "@/services/app-lock.service";
import * as auth from "@/services/auth.service";
import * as biometric from "@/services/biometric.service";
import * as sync from "@/services/sync.api";
import { EntryKind } from "@/enums/vault.enum";
import { encryptJson, generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { newId } from "@/utils/id.utils";
import { entryAad } from "@/utils/vault.utils";
import { loadVaultKey } from "@/services/key-store.service";
import { clearUnlockedKey, isUnlocked } from "@/services/secure-memory.service";
import { loadSession, saveSession } from "@/services/session.service";
import {
  configureAppLock,
  finishSetupWithEnteredKey,
  finishSetupWithNewKey,
} from "@/services/setup.service";
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

const SESSION = {
  userId: "01JABC",
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  token: "t".repeat(43),
  expiresAt: "2026-12-15T10:00:00.000Z",
  recoveryKeyConfigured: false,
  setupDone: false,
};

describe("configureAppLock", () => {
  it("saves just the PIN when biometrics are not wanted", async () => {
    const enroll = vi.spyOn(biometric, "enrollBiometric");
    await expect(configureAppLock("135792", false)).resolves.toEqual({ biometricFailed: false });
    expect(await hasPin()).toBe(true);
    expect(await isBiometricEnabled()).toBe(false);
    expect(enroll).not.toHaveBeenCalled();
  });

  it("also enrolls biometrics when asked", async () => {
    await saveSession(SESSION);
    vi.spyOn(biometric, "enrollBiometric").mockResolvedValue("cred-1");
    await expect(configureAppLock("135792", true)).resolves.toEqual({ biometricFailed: false });
    expect(await getBiometricCredentialId()).toBe("cred-1");
  });

  it("keeps the PIN and reports it when biometric enrollment fails", async () => {
    await saveSession(SESSION);
    vi.spyOn(biometric, "enrollBiometric").mockRejectedValue(new Error("cancelled"));
    await expect(configureAppLock("135792", true)).resolves.toEqual({ biometricFailed: true });
    expect(await hasPin()).toBe(true);
    expect(await isBiometricEnabled()).toBe(false);
  });
});

describe("finishSetupWithNewKey", () => {
  it("tells the server, keeps a non-extractable key, marks setup done and unlocks", async () => {
    await saveSession(SESSION);
    const server = vi.spyOn(auth, "markRecoveryKeyConfigured").mockResolvedValue();
    await finishSetupWithNewKey(generateRecoveryKey());

    expect(server).toHaveBeenCalledOnce();
    expect((await loadVaultKey())?.extractable).toBe(false);
    expect((await loadSession())?.setupDone).toBe(true);
    expect(isUnlocked()).toBe(true);
  });

  it("stores nothing when the server can't be told, so the user can retry", async () => {
    await saveSession(SESSION);
    vi.spyOn(auth, "markRecoveryKeyConfigured").mockRejectedValue(
      new ApiError(ApiErrorKind.Network, "Offline"),
    );
    await expect(finishSetupWithNewKey(generateRecoveryKey())).rejects.toMatchObject({
      kind: ApiErrorKind.Network,
    });
    await expect(loadVaultKey()).resolves.toBeNull();
    expect((await loadSession())?.setupDone).toBe(false);
    expect(isUnlocked()).toBe(false);
  });
});

describe("finishSetupWithEnteredKey", () => {
  const sealedEntry = async (key: CryptoKey) => {
    const id = newId();
    return {
      id,
      updatedAt: 1_000,
      _deleted: false,
      envelope: await encryptJson(
        key,
        { kind: EntryKind.Note, title: "Wifi", body: "x" },
        entryAad(id),
      ),
    };
  };
  const serverHas = (documents: Awaited<ReturnType<typeof sealedEntry>>[]) =>
    vi
      .spyOn(sync, "pullChanges")
      .mockResolvedValue({ documents, checkpoint: { seq: documents.length } });

  beforeEach(async () => {
    await saveSession({ ...SESSION, recoveryKeyConfigured: true });
  });

  it("accepts the key that opens the server's vault, in display format, without telling the server", async () => {
    const hex = generateRecoveryKey();
    const pull = serverHas([await sealedEntry(await importRecoveryKey(hex))]);
    const server = vi.spyOn(auth, "markRecoveryKeyConfigured");
    await finishSetupWithEnteredKey(hex.replace(/(.{8})(?!$)/g, "$1-").toUpperCase());

    expect(pull).toHaveBeenCalledOnce();
    expect(server).not.toHaveBeenCalled();
    expect(await loadVaultKey()).not.toBeNull();
    expect((await loadSession())?.setupDone).toBe(true);
    expect(isUnlocked()).toBe(true);
  });

  it("refuses a well-formed key that does not open the server's vault, and stores nothing", async () => {
    serverHas([await sealedEntry(await importRecoveryKey(generateRecoveryKey()))]);
    await expect(finishSetupWithEnteredKey(generateRecoveryKey())).rejects.toMatchObject({
      kind: CryptoErrorKind.InvalidRecoveryKey,
      message: expect.stringContaining("doesn't unlock this vault") as unknown,
    });
    await expect(loadVaultKey()).resolves.toBeNull();
    expect((await loadSession())?.setupDone).toBe(false);
    expect(isUnlocked()).toBe(false);
  });

  it("accepts the key when only some of the sampled entries open (one damaged entry is not a wrong key)", async () => {
    const hex = generateRecoveryKey();
    const good = await sealedEntry(await importRecoveryKey(hex));
    const damaged = { ...(await sealedEntry(await importRecoveryKey(hex))), id: newId() };
    serverHas([damaged, good]);
    await expect(finishSetupWithEnteredKey(hex)).resolves.toBeUndefined();
  });

  it("accepts any well-formed key when the server's vault is empty", async () => {
    serverHas([]);
    await expect(finishSetupWithEnteredKey(generateRecoveryKey())).resolves.toBeUndefined();
    expect(isUnlocked()).toBe(true);
  });

  it("needs a connection: offline it says so and stores nothing", async () => {
    vi.spyOn(sync, "pullChanges").mockRejectedValue(new ApiError(ApiErrorKind.Network, "Offline"));
    await expect(finishSetupWithEnteredKey(generateRecoveryKey())).rejects.toMatchObject({
      kind: ApiErrorKind.Network,
    });
    await expect(loadVaultKey()).resolves.toBeNull();
    expect(isUnlocked()).toBe(false);
  });

  it("refuses a malformed key without asking the server", async () => {
    const pull = vi.spyOn(sync, "pullChanges");
    await expect(finishSetupWithEnteredKey("not a key")).rejects.toMatchObject({
      kind: CryptoErrorKind.InvalidRecoveryKey,
    });
    expect(pull).not.toHaveBeenCalled();
  });
});
