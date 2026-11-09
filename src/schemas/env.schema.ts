import { z } from "zod";

/**
 * Client-exposed environment variables.
 * Only `VITE_` prefixed variables reach the bundle, so never put secrets here.
 */
export const envSchema = z.object({
  VITE_APP_NAME: z.string().trim().min(1).default("PiVault"),
  VITE_API_BASE_URL: z.url({
    protocol: /^https?$/,
    error: (issue) =>
      issue.input === undefined
        ? "Required"
        : "Must be a valid http(s) URL, e.g. http://localhost:3000",
  }),
});

export type Env = z.infer<typeof envSchema>;
