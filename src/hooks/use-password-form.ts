import { useState } from "react";
import { EntryKind } from "@/enums/vault.enum";
import { useAutosave } from "@/hooks/use-autosave";
import { type CustomField, type PasswordInput, entryPayloadSchema } from "@/schemas/vault.schema";
import type { PasswordEntry } from "@/types/vault.types";
import {
  DEFAULT_GENERATOR,
  type GeneratorOptions,
  generatePassword,
} from "@/utils/password-generator.utils";

type Text = "title" | "username" | "password" | "url";

const start = (entry: PasswordEntry | null): PasswordInput => ({
  kind: EntryKind.Password,
  title: entry?.title ?? "",
  username: entry?.username ?? "",
  password: entry?.password ?? "",
  url: entry?.url ?? "",
  notes: entry?.notes ?? "",
  fields: entry?.fields ?? [],
});

/** The password form: fields, custom fields, the generator, and saving by itself as you type. */
export function usePasswordForm(entry: PasswordEntry | null) {
  const [values, setValues] = useState(() => start(entry));
  const [generator, setGenerator] = useState<GeneratorOptions>(DEFAULT_GENERATOR);
  const [sheet, setSheet] = useState<"none" | "generator" | "delete">("none");
  const fields = values.fields ?? [];

  // A custom field with no label yet is kept on screen but not saved.
  const input: PasswordInput = {
    ...values,
    fields: fields.filter((field) => field.label.trim() !== ""),
  };
  const save = useAutosave(entry?.id ?? null, input, entryPayloadSchema.safeParse(input).success);

  const setFields = (next: CustomField[]) => {
    setValues((current) => ({ ...current, fields: next }));
  };

  return {
    values,
    fields,
    status: save.status,
    save,
    sheet,
    generator,
    set: (key: Text, value: string) => {
      setValues((current) => ({ ...current, [key]: value }));
    },
    reroll: () => {
      setValues((current) => ({ ...current, password: generatePassword(generator) }));
    },
    useGenerated: (password: string, options: GeneratorOptions) => {
      setGenerator(options);
      setValues((current) => ({ ...current, password }));
      setSheet("none");
    },
    open: setSheet,
    close: () => {
      setSheet("none");
    },
    addField: () => {
      setFields([...fields, { label: "", value: "" }]);
    },
    changeField: (index: number, patch: Partial<CustomField>) => {
      setFields(fields.map((field, at) => (at === index ? { ...field, ...patch } : field)));
    },
    removeField: (index: number) => {
      setFields(fields.filter((_, at) => at !== index));
    },
  };
}
