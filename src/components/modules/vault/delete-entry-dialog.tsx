import { Trash2Icon } from "lucide-react";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { IconTile } from "@/components/modules/kit/icon-tile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import { useDeleteEntry } from "@/hooks/use-delete-entry";
import type { VaultEntry } from "@/types/vault.types";

interface DeleteEntryDialogProps {
  entry: Pick<VaultEntry, "id" | "kind" | "title">;
  onClose: () => void;
  /** Called after the entry is gone. Defaults to closing. */
  onDeleted?: () => void;
  /** Waited for before deleting (an editor pauses its autosave here). */
  onBeforeDelete?: () => Promise<void>;
  /** The delete failed (the editor resumes its autosave). */
  onDeleteFailed?: () => void;
}

/** Permanent delete, confirmed first: no trash, no undo. Names what is going. */
export function DeleteEntryDialog({
  entry,
  onClose,
  onDeleted,
  onBeforeDelete,
  onDeleteFailed,
}: DeleteEntryDialogProps) {
  const { confirm, pending, error } = useDeleteEntry(entry.id, onDeleted ?? onClose, {
    before: onBeforeDelete,
    failed: onDeleteFailed,
  });

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <IconTile destructive className="size-11 rounded-[0.9375rem] [&_svg]:size-5">
            <Trash2Icon />
          </IconTile>
          <DialogTitle>{CRUD_COPY.deleteTitle(entry.kind)}</DialogTitle>
          <DialogDescription>{CRUD_COPY.deleteBody}</DialogDescription>
        </DialogHeader>
        <p className="truncate rounded-[0.875rem] bg-muted px-3.5 py-3 text-[0.78125rem] font-semibold">
          {entry.title}
        </p>
        <FormErrorBanner message={error} />
        <DialogFooter className="grid grid-cols-2 gap-2.5">
          <DialogClose render={<Button variant="outline" disabled={pending} />}>
            {CRUD_COPY.cancel}
          </DialogClose>
          <Button variant="destructive" disabled={pending} onClick={() => void confirm()}>
            {CRUD_COPY.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
