import type { EncryptedEnvelope } from "@/schemas/crypto.schema";
import type { NoteInput, PasswordInput } from "@/schemas/vault.schema";

/** What is stored per entry in the local database (and later sent to the server): no plaintext. */
export interface VaultDocument {
  /** ULID. Its time part is the creation time. */
  id: string;
  /** Epoch ms of the last change; drives ordering and (later) sync. */
  updatedAt: number;
  envelope: EncryptedEnvelope;
}

interface EntryMeta {
  id: string;
  createdAt: number;
  updatedAt: number;
}

/** A decrypted entry, only ever held in memory while the app is unlocked. */
export type NoteEntry = NoteInput & EntryMeta;
export type PasswordEntry = PasswordInput & EntryMeta;
export type VaultEntry = NoteEntry | PasswordEntry;

export interface VaultSnapshot {
  /** Newest first. */
  entries: VaultEntry[];
  /** Entries whose blob failed authentication (tampered, wrong key, corrupted). */
  unreadable: number;
}
