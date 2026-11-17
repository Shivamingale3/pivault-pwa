import { useLocation } from "react-router";
import { ScreenHeader } from "@/components/modules/kit/screen-header";
import { CustomFields } from "@/components/modules/vault/custom-fields";
import { DeleteEntryDialog } from "@/components/modules/vault/delete-entry-dialog";
import { EyebrowField } from "@/components/modules/vault/eyebrow-field";
import { GeneratorSheet } from "@/components/modules/vault/generator-sheet";
import { PasswordInput } from "@/components/modules/vault/password-input";
import { SaveChip } from "@/components/modules/vault/save-chip";
import { Button } from "@/components/ui/button";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import { EntryKind } from "@/enums/vault.enum";
import { usePasswordForm } from "@/hooks/use-password-form";
import { useBack } from "@/hooks/use-back";
import { ROUTES, entryPath } from "@/routes/route-paths";
import type { PasswordEntry } from "@/types/vault.types";

/** The password form (new or existing). There is no Save button: it saves as you type. */
export function PasswordForm({ entry }: { entry: PasswordEntry | null }) {
  const form = usePasswordForm(entry);
  const back = useBack();
  const fromView = (useLocation().state as { fromView?: boolean } | null)?.fromView === true;
  const { id } = form.save;

  return (
    <main className="flex min-h-full w-full justify-center bg-background">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
        }}
        className="flex w-full max-w-md flex-col gap-4 px-5.5 pt-[max(--spacing(9.5),env(safe-area-inset-top))] pb-[max(--spacing(6.5),env(safe-area-inset-bottom))]"
      >
        <ScreenHeader backTo={entry ? entryPath.password(entry.id) : ROUTES.passwords}>
          <SaveChip status={form.status} id={id} />
        </ScreenHeader>
        <EyebrowField
          id="title"
          label={CRUD_COPY.name}
          value={form.values.title}
          autoFocus={!entry}
          onChange={(value) => {
            form.set("title", value);
          }}
        />
        <EyebrowField
          id="username"
          label={CRUD_COPY.username}
          value={form.values.username}
          onChange={(value) => {
            form.set("username", value);
          }}
        />
        <EyebrowField
          id="password"
          label={CRUD_COPY.password}
          value={form.values.password}
          onChange={(value) => {
            form.set("password", value);
          }}
        >
          <PasswordInput
            id="password"
            value={form.values.password}
            onChange={(value) => {
              form.set("password", value);
            }}
            onReroll={form.reroll}
            onOpenGenerator={() => {
              form.open("generator");
            }}
          />
        </EyebrowField>
        <EyebrowField
          id="url"
          label={CRUD_COPY.website}
          type="url"
          value={form.values.url}
          onChange={(value) => {
            form.set("url", value);
          }}
        />
        <CustomFields
          fields={form.fields}
          onAdd={form.addField}
          onChange={form.changeField}
          onRemove={form.removeField}
        />
        {id && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="mt-auto border-border text-destructive-foreground"
            onClick={() => {
              form.open("delete");
            }}
          >
            {CRUD_COPY.deletePassword}
          </Button>
        )}
      </form>
      {form.sheet === "generator" && (
        <GeneratorSheet options={form.generator} onUse={form.useGenerated} onClose={form.close} />
      )}
      {form.sheet === "delete" && id && (
        <DeleteEntryDialog
          entry={{ id, kind: EntryKind.Password, title: form.values.title }}
          onClose={form.close}
          onBeforeDelete={form.save.pause}
          onDeleteFailed={form.save.resume}
          // Opened from the item's screen: skip past it too, the item is gone.
          onDeleted={() => {
            back(ROUTES.passwords, fromView ? 2 : 1);
          }}
        />
      )}
    </main>
  );
}
