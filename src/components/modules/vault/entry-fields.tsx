import { TextField } from "@/components/modules/vault/text-field";
import { PasswordField } from "@/components/modules/password-link/password-field";
import { EntryKind } from "@/enums/vault.enum";
import type { useEntryForm } from "@/hooks/use-entry-form";

interface EntryFieldsProps {
  form: ReturnType<typeof useEntryForm>;
  disabled: boolean;
}

/** The inputs for the chosen kind: a note has a title and text, a password has a login's details. */
export function EntryFields({ form, disabled }: EntryFieldsProps) {
  const title = (
    <TextField
      id="entry-title"
      label="Title"
      placeholder={form.kind === EntryKind.Note ? "Wifi codes" : "Bank"}
      value={form.title}
      onChange={(value) => {
        form.set("title", value);
      }}
      disabled={disabled}
      autoFocus
    />
  );

  if (form.kind === EntryKind.Note) {
    return (
      <>
        {title}
        <TextField
          id="entry-body"
          label="Note"
          multiline
          value={form.body}
          onChange={(value) => {
            form.set("body", value);
          }}
          disabled={disabled}
        />
      </>
    );
  }

  return (
    <>
      {title}
      <TextField
        id="entry-username"
        label="Username"
        value={form.username}
        onChange={(value) => {
          form.set("username", value);
        }}
        disabled={disabled}
      />
      <PasswordField
        id="entry-password"
        label="Password"
        placeholder="Password"
        value={form.password}
        onChange={(value) => {
          form.set("password", value);
        }}
        disabled={disabled}
      />
      <TextField
        id="entry-url"
        label="Website"
        type="url"
        placeholder="https://"
        value={form.url}
        onChange={(value) => {
          form.set("url", value);
        }}
        disabled={disabled}
      />
      <TextField
        id="entry-notes"
        label="Notes"
        multiline
        value={form.notes}
        onChange={(value) => {
          form.set("notes", value);
        }}
        disabled={disabled}
      />
    </>
  );
}
