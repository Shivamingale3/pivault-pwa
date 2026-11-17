import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { allDocuments } from "@/db/vault.repository";
import { EntryKind } from "@/enums/vault.enum";
import { generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { openWithAny } from "@/services/entry-crypto.service";
import * as keyCheck from "@/services/key-check.service";
import { loadPendingVaultKey, loadVaultKey, saveVaultKey } from "@/services/key-store.service";
import {
  allOnServer,
  beginKeyReplacement,
  completeKeyReplacement,
  hasPendingReplacement,
  reencryptVault,
} from "@/services/key-rotation.service";
import {
  clearUnlockedKey,
  getDecryptionKeys,
  setUnlockedKey,
} from "@/services/secure-memory.service";
import { clearSyncedState, recordServerVersions } from "@/services/synced-state.service";
import { addEntry } from "@/services/vault.service";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

freshIndexedDbPerTest();

let oldKey: CryptoKey;
beforeEach(async () => {
  oldKey = await importRecoveryKey(generateRecoveryKey());
  await saveVaultKey(oldKey);
  setUnlockedKey(oldKey);
});
afterEach(async () => {
  clearUnlockedKey();
  await clearSyncedState();
  vi.restoreAllMocks();
});

const opensWith = async (key: CryptoKey) =>
  Promise.all((await allDocuments()).map(async (doc) => (await openWithAny([key], doc)) !== null));

describe("replacing the recovery key", () => {
  it("re-encrypts every entry with the new key, so the old key no longer opens any", async () => {
    await addEntry({ kind: EntryKind.Note, title: "Wifi", body: "x" });
    await addEntry({ kind: EntryKind.Note, title: "Bank", body: "y" });
    const hex = generateRecoveryKey();
    await beginKeyReplacement(hex);
    expect(await hasPendingReplacement()).toBe(true);
    expect(getDecryptionKeys()).toHaveLength(2);

    const progress: number[] = [];
    expect(await reencryptVault((done) => progress.push(done))).toEqual({
      redone: 2,
      unreadable: 0,
    });
    expect(progress).toEqual([1, 2]);
    expect(await opensWith(await importRecoveryKey(hex))).toEqual([true, true]);
    expect(await opensWith(oldKey)).toEqual([false, false]);

    // Running it again changes nothing.
    expect(await reencryptVault()).toEqual({ redone: 0, unreadable: 0 });
  });

  it("only finishes once the server has everything, then retires the old key", async () => {
    const entry = await addEntry({ kind: EntryKind.Note, title: "Wifi", body: "x" });
    const hex = generateRecoveryKey();
    await beginKeyReplacement(hex);
    await reencryptVault();
    expect(await allOnServer()).toBe(false);
    const [doc] = await allDocuments();
    await recordServerVersions([{ id: entry.id, updatedAt: doc?.updatedAt ?? 0, _deleted: false }]);
    expect(await allOnServer()).toBe(true);

    const replace = vi.spyOn(keyCheck, "replaceKeyCheck").mockResolvedValue();
    await completeKeyReplacement();
    const [sent] = replace.mock.calls[0] ?? [];
    if (!sent) throw new Error("expected a new key check");
    expect(await keyCheck.opensKeyCheck(await importRecoveryKey(hex), sent)).toBe(true);
    expect(await keyCheck.opensKeyCheck(oldKey, sent)).toBe(false);
    expect(await hasPendingReplacement()).toBe(false);
    expect(getDecryptionKeys()).toHaveLength(1);
    const kept = await loadVaultKey();
    if (!kept) throw new Error("expected a vault key");
    expect(await opensWith(kept)).toEqual([true]);
  });

  it("keeps both keys when the server can't be told, so it can try again", async () => {
    await beginKeyReplacement(generateRecoveryKey());
    vi.spyOn(keyCheck, "replaceKeyCheck").mockRejectedValue(new Error("offline"));
    await expect(completeKeyReplacement()).rejects.toThrow("offline");
    expect(await loadPendingVaultKey()).not.toBeNull();
    expect(getDecryptionKeys()).toHaveLength(2);
    const vaultKey = await loadVaultKey();
    expect(vaultKey).not.toBeNull();
  });

  it("counts entries neither key opens and leaves them alone", async () => {
    setUnlockedKey(await importRecoveryKey(generateRecoveryKey()));
    await addEntry({ kind: EntryKind.Note, title: "Foreign", body: "z" });
    setUnlockedKey(oldKey);
    await beginKeyReplacement(generateRecoveryKey());
    expect(await reencryptVault()).toEqual({ redone: 0, unreadable: 1 });
  });
});
