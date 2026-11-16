import { z } from "zod";
import { EntryKind } from "@/enums/vault.enum";

/**
 * When each item was last opened, revealed or copied: only ids, kinds and times, never titles or
 * secrets. It drives "Recently opened" and the "most recent first" order.
 */
export const usageSchema = z.record(
  z.string().length(26),
  z.object({
    kind: z.enum([EntryKind.Note, EntryKind.Password]),
    at: z.number().int().nonnegative(),
  }),
);

export type UsageMap = z.infer<typeof usageSchema>;
