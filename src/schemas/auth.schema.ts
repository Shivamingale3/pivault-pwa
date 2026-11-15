import { z } from "zod";

/** `data` of POST /api/auth/login. */
export const loginResponseSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.iso.datetime(),
  user: z.object({
    id: z.string().min(1),
    email: z.string().min(1),
    firstName: z.string(),
    lastName: z.string(),
  }),
  recoveryKeyConfigured: z.boolean(),
});

/** Endpoints that answer with a message only (forgot-password, logout, recovery-key-configured). */
export const emptyResponseSchema = z.undefined();

const emailSchema = z.email();
export const isValidEmail = (value: string): boolean => emailSchema.safeParse(value.trim()).success;
