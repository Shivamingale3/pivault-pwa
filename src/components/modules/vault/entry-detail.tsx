import { CopyButton } from "@/components/modules/vault/copy-button";
import { DetailField } from "@/components/modules/vault/detail-field";
import { PasswordDetail } from "@/components/modules/vault/password-detail";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { EntryKind } from "@/enums/vault.enum";
import type { VaultEntry } from "@/types/vault.types";
import { formatDateTime } from "@/utils/date.utils";

interface EntryDetailProps {
  entry: VaultEntry;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

/** Read-only view of one decrypted item, with the actions for it. */
export function EntryDetail({ entry, onEdit, onDelete, onClose }: EntryDetailProps) {
  return (
    <Drawer
      open
      showSwipeHandle
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{entry.title}</DrawerTitle>
          <DrawerDescription>
            {entry.kind === EntryKind.Note ? "Note" : "Password"} · updated{" "}
            {formatDateTime(entry.updatedAt)}
          </DrawerDescription>
        </DrawerHeader>
        <dl className="flex flex-col gap-3 overflow-y-auto px-6">
          {entry.kind === EntryKind.Note ? (
            <DetailField label="Note" actions={<CopyButton value={entry.body} label="Note" />}>
              {entry.body || "Empty"}
            </DetailField>
          ) : (
            <PasswordDetail entry={entry} />
          )}
        </dl>
        <DrawerFooter>
          <Button
            type="button"
            size="lg"
            onClick={() => {
              onEdit(entry.id);
            }}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="lg"
            variant="destructive-soft"
            onClick={() => {
              onDelete(entry.id);
            }}
          >
            Delete
          </Button>
          <DrawerClose render={<Button type="button" size="lg" variant="ghost" />}>
            Close
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
