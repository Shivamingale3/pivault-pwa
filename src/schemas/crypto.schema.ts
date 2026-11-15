import { z } from "zod";
import { ENVELOPE_ALGORITHM, ENVELOPE_VERSION } from "@/constants/crypto.constants";

/** Versioned encrypted payload: IV and ciphertext are base64. The IV is not secret. */
export const encryptedEnvelopeSchema = z.object({
  version: z.literal(ENVELOPE_VERSION),
  algorithm: z.literal(ENVELOPE_ALGORITHM),
  iv: z.base64(),
  ciphertext: z.base64(),
});

export type EncryptedEnvelope = z.infer<typeof encryptedEnvelopeSchema>;
