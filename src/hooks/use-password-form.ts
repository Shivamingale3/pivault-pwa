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

const UNNAMED_FIELD = "Other";

/** The inputs that stay hidden until the user adds them. */
export type Optional = "username" | "url";

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
  // Name and password are always there; username and website appear when asked for (or filled in).
  const [shown, setShown] = useState<Record<Optional, boolean>>(() => ({
    username: (entry?.username ?? "") !== "",
    url: (entry?.url ?? "") !== "",
  }));
  /** The field the user just asked for, so it gets the cursor. */
  const [justAdded, setJustAdded] = useState<Optional | "field" | null>(null);
  const fields = values.fields ?? [];

  // An empty row is not saved; a value with no label yet is saved under a plain name, never dropped.
  const input: PasswordInput = {
    ...values,
    fields: fields
      .filter((field) => field.label.trim() !== "" || field.value !== "")
      .map((field) => (field.label.trim() === "" ? { ...field, label: UNNAMED_FIELD } : field)),
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
    shown,
    justAdded,
    show: (key: Optional) => {
      setShown((current) => ({ ...current, [key]: true }));
      setJustAdded(key);
    },
    open: setSheet,
    close: () => {
      setSheet("none");
    },
    addField: () => {
      setFields([...fields, { label: "", value: "" }]);
      setJustAdded("field");
    },
    changeField: (index: number, patch: Partial<CustomField>) => {
      setFields(fields.map((field, at) => (at === index ? { ...field, ...patch } : field)));
    },
    removeField: (index: number) => {
      setFields(fields.filter((_, at) => at !== index));
    },
  };
}
