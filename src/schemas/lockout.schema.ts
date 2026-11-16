import { z } from "zod";

/** `data` of the 429 that ends a round of wrong passwords (backend `LoginLockData`). */
export const loginLockSchema = z.object({
  retryAfterSeconds: z.number().int().nonnegative(),
  attempt: z.number().int().positive(),
  attemptsPerRound: z.number().int().positive(),
  nextWaitSeconds: z.number().int().nonnegative(),
});

export type LoginLock = z.infer<typeof loginLockSchema>;

/** The lock details from a failed login, or null when the error isn't a lockout. */
export const parseLoginLock = (data: unknown): LoginLock | null => {
  const parsed = loginLockSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
};
