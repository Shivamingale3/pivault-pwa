import { useNavigate } from "react-router";
import { DeleteEntryDialog } from "@/components/modules/vault/delete-entry-dialog";
import { EntryActionSheet } from "@/components/modules/vault/entry-action-sheet";
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
  const navigate = useNavigate();
  if (detail.overlay === "actions")
    return (
      <EntryActionSheet title={entry.title} onDelete={detail.askDelete} onClose={detail.close} />
    );
  if (detail.overlay === "delete")
    return (
      <DeleteEntryDialog
        entry={entry}
        onClose={detail.close}
        onDeleted={() => void navigate(listPath, { replace: true })}
      />
    );
  return null;
}
