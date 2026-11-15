import { describe, expect, it } from "vitest";
import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbGet, idbPut } from "@/db/idb";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import { StorageErrorKind } from "@/enums/storage.enum";
import {
  generateLoginKeyPair,
  generateRecoveryKey,
  importRecoveryKey,
} from "@/services/crypto.service";
import {
  clearLoginKeyPair,
  clearVaultKey,
  loadLoginKeyPair,
  loadVaultKey,
  saveLoginKeyPair,
  saveVaultKey,
} from "@/services/key-store.service";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

freshIndexedDbPerTest();

describe("vault key store", () => {
  it("returns null when nothing is saved", async () => {
    await expect(loadVaultKey()).resolves.toBeNull();
  });

  it("keeps a working non-extractable key across reads", async () => {
    const key = await importRecoveryKey(generateRecoveryKey());
    await saveVaultKey(key);
    const restored = await loadVaultKey();
    if (!restored) throw new Error("expected a saved key");
    expect(restored.extractable).toBe(false);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, Uint8Array.of(7));
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, restored, ciphertext);
    expect(new Uint8Array(plain)).toEqual(Uint8Array.of(7));
  });

  it("refuses to store an extractable key", async () => {
    const extractable = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
      "encrypt",
      "decrypt",
    ]);
    await expect(saveVaultKey(extractable)).rejects.toMatchObject({ kind: CryptoErrorKind.Failed });
    await expect(loadVaultKey()).resolves.toBeNull();
  });

  it("reports corrupted data once, removes it, then behaves as empty", async () => {
    await idbPut(StoreName.Keys, RecordId.VaultKey, "raw-bytes-oops");
    await expect(loadVaultKey()).rejects.toMatchObject({ kind: StorageErrorKind.Corrupted });
    await expect(idbGet(StoreName.Keys, RecordId.VaultKey)).resolves.toBeUndefined();
    await expect(loadVaultKey()).resolves.toBeNull();
  });

  it("clears the key", async () => {
    await saveVaultKey(await importRecoveryKey(generateRecoveryKey()));
    await clearVaultKey();
    await expect(loadVaultKey()).resolves.toBeNull();
  });
});

describe("login key pair store", () => {
  it("stores, restores and clears the pair", async () => {
    await saveLoginKeyPair(await generateLoginKeyPair());
    const pair = await loadLoginKeyPair();
    expect(pair?.privateKey.extractable).toBe(false);
    expect(pair?.publicKey.type).toBe("public");
    await clearLoginKeyPair();
    await expect(loadLoginKeyPair()).resolves.toBeNull();
  });

  it("flags a malformed pair as corrupted", async () => {
    await idbPut(StoreName.Keys, RecordId.LoginKeyPair, { privateKey: 1 });
    await expect(loadLoginKeyPair()).rejects.toMatchObject({ kind: StorageErrorKind.Corrupted });
  });
});
