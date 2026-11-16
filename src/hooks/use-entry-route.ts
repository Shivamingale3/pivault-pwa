import { useParams } from "react-router";
import type { EntryKind } from "@/enums/vault.enum";
import { useVault } from "@/hooks/use-vault";
import type { VaultEntry } from "@/types/vault.types";

/** The entry named in the URL, once the vault is loaded. `missing` means it is gone (or the wrong kind). */
export function useEntryRoute<K extends EntryKind>(kind: K) {
  const { id } = useParams();
  const { entries, status } = useVault();
  const found = entries.find((entry) => entry.id === id && entry.kind === kind);
  return {
    loading: status === "loading",
    entry: (found ?? null) as Extract<VaultEntry, { kind: K }> | null,
    missing: status !== "loading" && !found,
  };
}
