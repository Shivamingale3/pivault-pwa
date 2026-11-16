import type { SubmitEvent } from "react";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { EntryFields } from "@/components/modules/vault/entry-fields";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EntryKind } from "@/enums/vault.enum";
import { useEntryEditor } from "@/hooks/use-entry-editor";
import type { VaultEntry } from "@/types/vault.types";

const isKind = (value: unknown): value is EntryKind =>
  value === EntryKind.Note || value === EntryKind.Password;

interface EntryEditorProps {
  /** The entry being edited, or null to create a new one. */
  entry: VaultEntry | null;
  /** When creating: the kind to make, and no chooser. Without it the user picks. */
  kind?: EntryKind;
  onClose: () => void;
}

/** Bottom sheet to add or edit an item. Saves encrypted to this device, then closes. */
export function EntryEditor({ entry, kind, onClose }: EntryEditorProps) {
  const { form, submit, pending, error } = useEntryEditor(entry, onClose, kind);
  const creating = entry === null;

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    void submit();
  };

  return (
    <Drawer
      open
      showSwipeHandle
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DrawerContent>
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col gap-4">
          <DrawerHeader>
            <DrawerTitle>{creating ? "Add item" : `Edit ${form.kind}`}</DrawerTitle>
            <DrawerDescription>Encrypted on this device before it is saved.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-4 overflow-y-auto px-6">
            {creating && kind === undefined && (
              <ToggleGroup
                aria-label="Type"
                value={[form.kind]}
                onValueChange={(values) => {
                  const [next] = values;
                  if (isKind(next)) form.set("kind", next);
                }}
                spacing={1}
                className="self-start rounded-full bg-muted p-1"
              >
                <ToggleGroupItem value={EntryKind.Note} size="sm">
                  Note
                </ToggleGroupItem>
                <ToggleGroupItem value={EntryKind.Password} size="sm">
                  Password
                </ToggleGroupItem>
              </ToggleGroup>
            )}
            <EntryFields form={form} disabled={pending} />
            <FormErrorBanner message={error} />
          </div>
          <DrawerFooter>
            <PrimaryCta type="submit" disabled={!form.valid} busy={pending} busyLabel="Saving">
              Save
            </PrimaryCta>
            <DrawerClose render={<Button type="button" size="lg" variant="ghost" />}>
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
