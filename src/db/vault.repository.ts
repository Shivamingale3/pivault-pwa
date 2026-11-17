import { type Observable, from, map, switchMap } from "rxjs";
import { getVaultDb } from "@/db/vault.db";
import type { EncryptedEnvelope } from "@/schemas/crypto.schema";
import type { VaultDocument } from "@/types/vault.types";

/** Plain database access for entries. Knows nothing about keys: it only moves opaque blobs. */
export async function insertDocument(document: VaultDocument): Promise<void> {
  await (await getVaultDb()).entries.insert(document);
}

export async function findDocument(id: string): Promise<VaultDocument | null> {
  const found = await (await getVaultDb()).entries.findOne(id).exec();
  return found ? found.toMutableJSON() : null;
}

/** Returns false when the entry does not exist. */
export async function replaceEnvelope(
  id: string,
  updatedAt: number,
  envelope: EncryptedEnvelope,
): Promise<boolean> {
  const found = await (await getVaultDb()).entries.findOne(id).exec();
  if (!found) return false;
  await found.patch({ updatedAt, envelope });
  return true;
}

/** Returns false when the entry does not exist. */
export async function deleteDocument(id: string): Promise<boolean> {
  const found = await (await getVaultDb()).entries.findOne(id).exec();
  if (!found) return false;
  await found.remove();
  return true;
}

/** Every live entry, once (no watching). */
export async function allDocuments(): Promise<VaultDocument[]> {
  const found = await (await getVaultDb()).entries.find().exec();
  return found.map((entry) => entry.toMutableJSON());
}

/** Every live entry, newest change first, re-emitted whenever something changes. */
export const watchDocuments = (): Observable<VaultDocument[]> =>
  from(getVaultDb()).pipe(
    switchMap((database) => database.entries.find({ sort: [{ updatedAt: "desc" }] }).$),
    map((documents) => documents.map((entry) => entry.toMutableJSON())),
  );
