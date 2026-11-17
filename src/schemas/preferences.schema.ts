import { z } from "zod";

/** Lock the app after this long in the background. 0 is "instantly". */
export const AUTO_LOCK_CHOICES = [0, 60_000, 300_000, 900_000] as const;
/** Clear a copied secret from the clipboard after this long. `null` is "never". */
export const CLIPBOARD_CHOICES = [15_000, 30_000, 60_000, null] as const;

/** The avatar styles on offer (DiceBear, artwork CC0). */
export const AVATAR_STYLES = ["notionists", "lorelei"] as const;

export const avatarChoiceSchema = z.object({
  style: z.enum(AVATAR_STYLES),
  seed: z.string().min(1).max(40),
});
export type AvatarChoice = z.infer<typeof avatarChoiceSchema>;

export const preferencesSchema = z.object({
  autoLockMs: z.union(AUTO_LOCK_CHOICES.map((value) => z.literal(value))),
  clipboardClearMs: z.union(CLIPBOARD_CHOICES.map((value) => z.literal(value))),
  /** The picked avatar, or null for the initial. Older records have none. */
  avatar: avatarChoiceSchema.nullable().default(null),
});

export type Preferences = z.infer<typeof preferencesSchema>;

/** What the design marks as the default: lock after 1 minute, clear the clipboard after 30 seconds. */
export const DEFAULT_PREFERENCES: Preferences = {
  autoLockMs: 60_000,
  clipboardClearMs: 30_000,
  avatar: null,
};
