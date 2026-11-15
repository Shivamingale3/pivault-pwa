import type { EntryInput } from "@/schemas/vault.schema";
import type { VaultEntry } from "@/types/vault.types";

export type VaultStatus = "loading" | "ready" | "error";

export interface VaultContextValue {
  status: VaultStatus;
  /** Decrypted, newest first. Exists only while the app is unlocked. */
  entries: VaultEntry[];
  /** Entries that failed to decrypt and are hidden. */
  unreadable: number;
  add: (input: EntryInput) => Promise<VaultEntry>;
  edit: (id: string, input: EntryInput) => Promise<VaultEntry>;
  remove: (id: string) => Promise<void>;
}
