import { z } from "zod";

/** The envelope every endpoint answers with: `{ success, message, data? }`. */
export const apiEnvelopeSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown().optional(),
});
