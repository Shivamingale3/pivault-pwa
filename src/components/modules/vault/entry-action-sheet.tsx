import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CRUD_COPY } from "@/constants/vault-design.constants";

interface EntryActionSheetProps {
  title: string;
  onDelete: () => void;
  onClose: () => void;
}

/** The overflow menu as a bottom action sheet: Delete, and a separate Cancel. */
export function EntryActionSheet({ title, onDelete, onClose }: EntryActionSheetProps) {
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
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className="sr-only">Actions for this item</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2.5 px-6 pb-6">
          <Button
            type="button"
            variant="destructive-soft"
            size="lg"
            className="justify-start gap-3 rounded-3xl"
            onClick={onDelete}
          >
            <Trash2Icon aria-hidden="true" className="size-4" />
            {CRUD_COPY.delete}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-3xl"
            onClick={onClose}
          >
            {CRUD_COPY.cancel}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
