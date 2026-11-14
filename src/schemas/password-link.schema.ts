import { z } from "zod";

/** `data` of POST /api/auth/password-links/validate. */
export const linkStatusSchema = z.object({
  purpose: z.enum(["onboarding", "reset"]),
  expiresAt: z.iso.datetime(),
});

/** `data` of POST /api/auth/password-links/complete. */
export const linkCompletedSchema = z.object({ emailVerified: z.literal(true) });
