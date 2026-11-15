import {
  addRxPlugin,
  createRxDatabase,
  removeRxDatabase,
  type RxCollection,
  type RxDatabase,
  type RxStorage,
} from "rxdb/plugins/core";
import { RxDBLeaderElectionPlugin } from "rxdb/plugins/leader-election";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { STORAGE_ERROR_MESSAGES } from "@/constants/storage.constants";
import { VAULT_DB_NAME } from "@/constants/vault.constants";
import { lastWriteWins } from "@/db/vault.conflict";
import { vaultSchema } from "@/db/vault.schema";
import { StorageErrorKind } from "@/enums/storage.enum";
import { StorageError } from "@/services/storage.error";
import type { VaultDocument } from "@/types/vault.types";

// With several tabs open, only one of them (the leader) runs the sync.
addRxPlugin(RxDBLeaderElectionPlugin);

export type VaultCollection = RxCollection<VaultDocument>;
export type VaultDatabase = RxDatabase<{ entries: VaultCollection }>;

/** Read at call time, so tests can swap in a fresh in-memory IndexedDB per test. */
const storage = (): RxStorage<unknown, unknown> =>
  getRxStorageDexie({
    indexedDB: globalThis.indexedDB,
    IDBKeyRange: globalThis.IDBKeyRange,
  });

let opening: Promise<VaultDatabase> | null = null;

async function create(): Promise<VaultDatabase> {
  try {
    const database = await createRxDatabase<{ entries: VaultCollection }>({
      name: VAULT_DB_NAME,
      storage: storage(),
      multiInstance: typeof BroadcastChannel !== "undefined",
    });
    await database.addCollections({
      entries: { schema: vaultSchema, conflictHandler: lastWriteWins },
    });
    return database;
  } catch (error) {
    throw new StorageError(StorageErrorKind.Unavailable, STORAGE_ERROR_MESSAGES.unavailable, error);
  }
}

/** The one vault database of this device (opened on first use, shared after that). */
export function getVaultDb(): Promise<VaultDatabase> {
  opening ??= create().catch((error: unknown) => {
    opening = null;
    throw error;
  });
  return opening;
}

/** Releases the connection. The data stays on the device. */
export async function closeVaultDb(): Promise<void> {
  const current = opening;
  opening = null;
  if (current) await (await current.catch(() => null))?.close();
}

/** Deletes every entry from this device (sign out). */
export async function removeVaultDb(): Promise<void> {
  await closeVaultDb();
  try {
    await removeRxDatabase(VAULT_DB_NAME, storage());
  } catch (error) {
    throw new StorageError(StorageErrorKind.Failed, STORAGE_ERROR_MESSAGES.failed, error);
  }
}
