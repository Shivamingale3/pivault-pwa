import { EntryRow } from "@/components/modules/vault/entry-row";
import type { VaultEntry } from "@/types/vault.types";

interface EntryListProps {
  entries: VaultEntry[];
  onOpen: (id: string) => void;
}

export function EntryList({ entries, onOpen }: EntryListProps) {
  return (
    <ul aria-label="Vault items" className="flex flex-col gap-1">
      {entries.map((entry) => (
        <li key={entry.id}>
          <EntryRow entry={entry} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  );
}
