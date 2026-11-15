import type { RxJsonSchema } from "rxdb";
import type { VaultDocument } from "@/types/vault.types";

const MAX_TIMESTAMP = 8_640_000_000_000_000;

/**
 * The only collection: one document per entry. Everything the user typed is inside
 * `envelope.ciphertext`; the other fields are what sync and ordering need.
 */
export const vaultSchema: RxJsonSchema<VaultDocument> = {
  title: "vault entry",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 26 },
    updatedAt: { type: "number", minimum: 0, maximum: MAX_TIMESTAMP, multipleOf: 1 },
    envelope: {
      type: "object",
      properties: {
        version: { type: "number" },
        algorithm: { type: "string" },
        iv: { type: "string" },
        ciphertext: { type: "string" },
      },
      required: ["version", "algorithm", "iv", "ciphertext"],
    },
  },
  required: ["id", "updatedAt", "envelope"],
  indexes: ["updatedAt"],
};
