import { RecordId, STORAGE_ERROR_MESSAGES, StoreName } from "@/constants/storage.constants";
import { idbDelete, idbGet, idbPut } from "@/db/idb";
import { StorageErrorKind } from "@/enums/storage.enum";
import { type SessionRecord, sessionRecordSchema } from "@/schemas/session.schema";
import { StorageError } from "@/services/storage.error";

/** The remembered session, or null when logged out. An unreadable record is removed and reported. */
export async function loadSession(): Promise<SessionRecord | null> {
  const value = await idbGet(StoreName.Auth, RecordId.Session);
  if (value === undefined) return null;
  const parsed = sessionRecordSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  await idbDelete(StoreName.Auth, RecordId.Session).catch(() => undefined);
  throw new StorageError(StorageErrorKind.Corrupted, STORAGE_ERROR_MESSAGES.corrupted);
}

export const saveSession = (session: SessionRecord) =>
  idbPut(StoreName.Auth, RecordId.Session, sessionRecordSchema.parse(session));

/** Called once the PIN and recovery key are set up. */
export async function markSetupDone(): Promise<void> {
  const session = await loadSession();
  if (!session) {
    throw new StorageError(StorageErrorKind.Corrupted, STORAGE_ERROR_MESSAGES.corrupted);
  }
  await saveSession({ ...session, setupDone: true });
}

export const clearSession = () => idbDelete(StoreName.Auth, RecordId.Session);
