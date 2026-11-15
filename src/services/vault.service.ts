import { type Observable, from, switchMap } from "rxjs";
import { decodeTime } from "ulid";
import { MAX_PAYLOAD_BYTES, SYNC_MESSAGES } from "@/constants/sync.constants";
import { VAULT_MESSAGES } from "@/constants/vault.constants";
import {
  deleteDocument,
  findDocument,
  insertDocument,
  replaceEnvelope,
  watchDocuments,
} from "@/db/vault.repository";
import { StorageErrorKind } from "@/enums/storage.enum";
import { type EntryInput, entryPayloadSchema } from "@/schemas/vault.schema";
import { decryptJson, encryptJson } from "@/services/crypto.service";
import { getUnlockedKey } from "@/services/secure-memory.service";
import { StorageError } from "@/services/storage.error";
import type { VaultDocument, VaultEntry, VaultSnapshot } from "@/types/vault.types";
import { newId } from "@/utils/id.utils";
import { entryAad } from "@/utils/vault.utils";

const aadFor = entryAad;

/** An entry the server would refuse is refused here, with a clear message, before anything is saved. */
function assertFitsSync(payload: EntryInput): void {
  if (new TextEncoder().encode(JSON.stringify(payload)).length > MAX_PAYLOAD_BYTES) {
    throw new StorageError(StorageErrorKind.Failed, SYNC_MESSAGES.tooLarge);
  }
}

const toEntry = (id: string, updatedAt: number, payload: EntryInput): VaultEntry => ({
  ...payload,
  id,
  createdAt: decodeTime(id),
  updatedAt,
});

/** Validates, encrypts with the unlocked key and saves to the device. Returns the new entry. */
export async function addEntry(input: EntryInput): Promise<VaultEntry> {
  const payload = entryPayloadSchema.parse(input);
  assertFitsSync(payload);
  const key = getUnlockedKey();
  const id = newId();
  const updatedAt = Date.now();
  const envelope = await encryptJson(key, payload, aadFor(id));
  await insertDocument({ id, updatedAt, envelope });
  return toEntry(id, updatedAt, payload);
}

/** Re-encrypts the entry with a fresh IV. The id (and so the creation time) never changes. */
export async function editEntry(id: string, input: EntryInput): Promise<VaultEntry> {
  const payload = entryPayloadSchema.parse(input);
  assertFitsSync(payload);
  const key = getUnlockedKey();
  const existing = await findDocument(id);
  if (!existing) throw new StorageError(StorageErrorKind.Failed, VAULT_MESSAGES.notFound);
  const updatedAt = Math.max(Date.now(), existing.updatedAt + 1);
  const envelope = await encryptJson(key, payload, aadFor(id));
  if (!(await replaceEnvelope(id, updatedAt, envelope))) {
    throw new StorageError(StorageErrorKind.Failed, VAULT_MESSAGES.notFound);
  }
  return toEntry(id, updatedAt, payload);
}

/** Deleting something that is already gone is not an error. */
export async function removeEntry(id: string): Promise<void> {
  await deleteDocument(id);
}

async function openAll(documents: VaultDocument[]): Promise<VaultSnapshot> {
  const key = getUnlockedKey();
  const opened = await Promise.all(
    documents.map(async (document) => {
      try {
        const payload = await decryptJson(
          key,
          document.envelope,
          entryPayloadSchema,
          aadFor(document.id),
        );
        return toEntry(document.id, document.updatedAt, payload);
      } catch {
        return null;
      }
    }),
  );
  const entries = opened.filter((entry): entry is VaultEntry => entry !== null);
  return { entries, unreadable: opened.length - entries.length };
}

/**
 * Every entry decrypted, newest first, re-emitted on each change. Entries that fail to decrypt
 * are counted, not shown. Errors with `Locked` when the app is locked.
 */
export const watchEntries = (): Observable<VaultSnapshot> =>
  watchDocuments().pipe(switchMap((documents) => from(openAll(documents))));
