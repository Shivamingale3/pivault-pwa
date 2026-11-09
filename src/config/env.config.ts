import { z } from "zod";
import { envSchema, type Env } from "../schemas/env.schema.ts";

export class EnvValidationError extends Error {
  constructor(details: string) {
    super(`Invalid environment variables:\n${details}`);
    this.name = "EnvValidationError";
  }
}

/**
 * Validates a raw env source against the schema.
 * Throws an `EnvValidationError` with a readable report when invalid.
 */
export const validateEnv = (source: Record<string, unknown>): Readonly<Env> => {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    throw new EnvValidationError(z.prettifyError(result.error));
  }

  return Object.freeze(result.data);
};

/**
 * `import.meta.env` only exists inside the Vite runtime. This module is also
 * imported by `vite.config.ts` (Node), where only `validateEnv` is used.
 */
const isViteRuntime = typeof import.meta.env !== "undefined";

export const env: Readonly<Env> = isViteRuntime
  ? validateEnv(import.meta.env)
  : Object.freeze({} as Env);
