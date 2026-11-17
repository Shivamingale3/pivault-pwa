import { z } from "zod";

/**
 * What this device remembers about the logged-in account. The session token is only useful
 * together with this device's non-extractable login key (every API call is signed with it).
 */
export const sessionRecordSchema = z.object({
  userId: z.string().min(1),
  email: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
  token: z.string().min(1),
  expiresAt: z.iso.datetime(),
  /** The server already has a recovery key for this account (a returning user on a new device). */
  recoveryKeyConfigured: z.boolean(),
  /** App lock PIN and recovery key are done on this device. */
  setupDone: z.boolean(),
  /** The server is known to hold this account's recovery-key check (older sessions don't say). */
  keyCheckStored: z.boolean().optional(),
  /** The server said this session was replaced by a sign-in on another device. */
  endedElsewhere: z.boolean().optional(),
});

export type SessionRecord = z.infer<typeof sessionRecordSchema>;
