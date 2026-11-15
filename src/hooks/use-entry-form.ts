import { useState } from "react";
import { EntryKind } from "@/enums/vault.enum";
import { type EntryInput, entryPayloadSchema } from "@/schemas/vault.schema";
import type { VaultEntry } from "@/types/vault.types";

interface Fields {
  kind: EntryKind;
  title: string;
  body: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

const EMPTY: Fields = {
  kind: EntryKind.Note,
  title: "",
  body: "",
  username: "",
  password: "",
  url: "",
  notes: "",
};

const fromEntry = (entry: VaultEntry | null): Fields =>
  entry === null ? EMPTY : { ...EMPTY, ...entry };

/** Field state for the create / edit sheet, and the validated payload to save. */
export function useEntryForm(entry: VaultEntry | null) {
  const [fields, setFields] = useState<Fields>(() => fromEntry(entry));

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((current) => ({ ...current, [key]: value }));
  };

  const input: EntryInput =
    fields.kind === EntryKind.Note
      ? { kind: EntryKind.Note, title: fields.title, body: fields.body }
      : {
          kind: EntryKind.Password,
          title: fields.title,
          username: fields.username,
          password: fields.password,
          url: fields.url,
          notes: fields.notes,
        };

  return { ...fields, set, input, valid: entryPayloadSchema.safeParse(input).success };
}
