import { DeleteEntryDialog } from "@/components/modules/vault/delete-entry-dialog";
import { EntryActionSheet } from "@/components/modules/vault/entry-action-sheet";
import { useBack } from "@/hooks/use-back";
import type { useEntryDetail } from "@/hooks/use-entry-detail";
import type { VaultEntry } from "@/types/vault.types";

interface DetailOverlaysProps {
  entry: VaultEntry;
  detail: ReturnType<typeof useEntryDetail>;
  /** Where to go once the entry is deleted. */
  listPath: string;
}

/** The action sheet and the delete confirmation of a detail screen. */
export function DetailOverlays({ entry, detail, listPath }: DetailOverlaysProps) {
  const back = useBack();
  if (detail.overlay === "actions")
    return (
      <EntryActionSheet title={entry.title} onDelete={detail.askDelete} onClose={detail.close} />
    );
  if (detail.overlay === "delete")
    return (
      <DeleteEntryDialog
        entry={entry}
        onClose={detail.close}
        onDeleted={() => {
          back(listPath);
        }}
      />
    );
  return null;
}
