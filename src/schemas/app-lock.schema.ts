import { z } from "zod";

export const appLockRecordSchema = z.object({
  salt: z.base64(),
  hash: z.base64(),
  iterations: z.number().int().positive(),
  failedAttempts: z.number().int().nonnegative(),
  /** Epoch ms until which PIN checks are refused. */
  lockedUntil: z.number().nonnegative(),
  biometricEnabled: z.boolean(),
  /** WebAuthn credential id (base64url) of the enrolled platform authenticator. */
  credentialId: z.string().min(1).optional(),
});

export type AppLockRecord = z.infer<typeof appLockRecordSchema>;
