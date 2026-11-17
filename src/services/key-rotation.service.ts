import { firstValueFrom } from "rxjs";
import { allDocuments, replaceEnvelope } from "@/db/vault.repository";
import { encryptJson, importRecoveryKey } from "@/services/crypto.service";
import { openWithAny } from "@/services/entry-crypto.service";
import { makeKeyCheck, replaceKeyCheck } from "@/services/key-check.service";
import {
  clearPendingVaultKey,
  loadPendingVaultKey,
  savePendingVaultKey,
  saveVaultKey,
} from "@/services/key-store.service";
import {
  getDecryptionKeys,
  getUnlockedKey,
  setUnlockedKey,
} from "@/services/secure-memory.service";
import { isSynced, watchSyncedState } from "@/services/synced-state.service";
import { entryAad } from "@/utils/vault.utils";

/*
 * Replacing the recovery key, in steps that are safe to stop between:
 *   1. begin:     the new key is kept as "pending" next to the old one (nothing else changes yet)
 *   2. reencrypt: every entry still on the old key is encrypted again with the new one
 *   3. (sync):    everything goes to the server; `allOnServer` confirms it
 *   4. complete:  the server's key check switches to the new key, then the new key replaces the old
 * Until step 4 the old key still opens everything not yet redone, and a crash simply carries on
 * from where it stopped. The recovery key itself is never stored or sent.
 */

/** Step 1. Keeps the new key (non-extractable) as pending and puts both keys in memory. */
export async function beginKeyReplacement(recoveryKey: string): Promise<void> {
  const next = await importRecoveryKey(recoveryKey);
  const current = getUnlockedKey();
  await savePendingVaultKey(next);
  setUnlockedKey(next, current);
}

/** True while a replacement is waiting to finish (e.g. it was interrupted). */
export const hasPendingReplacement = async (): Promise<boolean> =>
  (await loadPendingVaultKey().catch(() => null)) !== null;

/**
 * Step 2. Encrypts again, with the new key, every entry the old key still opens. Entries the new
 * key opens are skipped, so running it twice is harmless. Returns how many entries are unreadable
 * with either key (they can't be saved and stay as they are).
 */
export async function reencryptVault(onProgress?: (done: number, total: number) => void) {
  const keys = getDecryptionKeys();
  const [next] = keys;
  if (!next || keys.length < 2) return { redone: 0, unreadable: 0 };
  const documents = await allDocuments();
  let redone = 0;
  let unreadable = 0;
  for (const [index, document] of documents.entries()) {
    const opened = await openWithAny(keys, document);
    if (!opened) unreadable += 1;
    else if (opened.keyIndex > 0) {
      const envelope = await encryptJson(next, opened.payload, entryAad(document.id));
      await replaceEnvelope(document.id, Math.max(Date.now(), document.updatedAt + 1), envelope);
      redone += 1;
    }
    onProgress?.(index + 1, documents.length);
  }
  return { redone, unreadable };
}

/** Step 3 check: the server holds the current version of every entry on this phone. */
export async function allOnServer(): Promise<boolean> {
  const [documents, state] = await Promise.all([
    allDocuments(),
    firstValueFrom(watchSyncedState()),
  ]);
  return documents.every((document) => isSynced(state, document.id, document.updatedAt));
}

/** Step 4. The server's check moves to the new key, then the new key becomes the vault key. */
export async function completeKeyReplacement(signal?: AbortSignal): Promise<void> {
  const next = getUnlockedKey();
  await replaceKeyCheck(await makeKeyCheck(next), signal);
  await saveVaultKey(next);
  await clearPendingVaultKey();
  setUnlockedKey(next);
}
