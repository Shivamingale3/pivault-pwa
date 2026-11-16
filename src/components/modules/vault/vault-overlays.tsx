import { DeleteEntryDialog } from "@/components/modules/vault/delete-entry-dialog";
import { EntryDetail } from "@/components/modules/vault/entry-detail";
import { EntryEditor } from "@/components/modules/vault/entry-editor";
import type { useVaultScreen } from "@/hooks/use-vault-screen";

/** Whichever sheet the vault screen currently has open. */
export function VaultOverlays({ screen }: { screen: ReturnType<typeof useVaultScreen> }) {
  const { open, target, close } = screen;
  if (open === "create")
    return <EntryEditor key="new" entry={null} kind={screen.createKind} onClose={close} />;
  if (!target) return null;
  switch (open) {
    case "edit":
      return <EntryEditor key={target.id} entry={target} onClose={close} />;
    case "delete":
      return <DeleteEntryDialog entry={target} onClose={close} />;
    case "detail":
      return (
        <EntryDetail
          entry={target}
          onEdit={screen.edit}
          onDelete={screen.confirmDelete}
          onClose={close}
        />
      );
    case "none":
      return null;
  }
}
