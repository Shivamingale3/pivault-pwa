import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
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
import { useDeleteEntry } from "@/hooks/use-delete-entry";
import type { VaultEntry } from "@/types/vault.types";

interface DeleteEntryDialogProps {
  entry: VaultEntry;
  onClose: () => void;
}

/** Permanent delete, confirmed first (matches the design: no trash, no undo). */
export function DeleteEntryDialog({ entry, onClose }: DeleteEntryDialogProps) {
  const { confirm, pending, error } = useDeleteEntry(entry.id, onClose);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete this {entry.kind}?</DialogTitle>
          <DialogDescription>This is permanent. There is no trash and no undo.</DialogDescription>
        </DialogHeader>
        <FormErrorBanner message={error} />
        <DialogFooter>
          <Button variant="destructive" disabled={pending} onClick={() => void confirm()}>
            Delete {entry.kind}
          </Button>
          <DialogClose render={<Button variant="ghost" disabled={pending} />}>Keep it</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
