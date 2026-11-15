import { z } from "zod";
import { ENTRY_LIMITS, VAULT_MESSAGES } from "@/constants/vault.constants";
import { EntryKind } from "@/enums/vault.enum";

const title = z.string().trim().min(1, VAULT_MESSAGES.titleRequired).max(ENTRY_LIMITS.title);

const noteSchema = z.object({
  kind: z.literal(EntryKind.Note),
  title,
  body: z.string().max(ENTRY_LIMITS.body),
});

const passwordSchema = z.object({
  kind: z.literal(EntryKind.Password),
  title,
  username: z.string().trim().max(ENTRY_LIMITS.username),
  /** Never trimmed: spaces can be part of a password. */
  password: z.string().min(1, VAULT_MESSAGES.passwordRequired).max(ENTRY_LIMITS.password),
  url: z.string().trim().max(ENTRY_LIMITS.url),
  notes: z.string().max(ENTRY_LIMITS.notes),
});

/** Everything that goes inside the encrypted blob of one entry. */
export const entryPayloadSchema = z.discriminatedUnion("kind", [noteSchema, passwordSchema]);

export type EntryInput = z.infer<typeof entryPayloadSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
