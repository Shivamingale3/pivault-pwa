import { z } from "zod";
import { encryptedEnvelopeSchema } from "@/schemas/crypto.schema";

/** One entry as the replication endpoints (and RxDB) use it. `_deleted` is RxDB's own field name. */
export const syncDocumentSchema = z.object({
  id: z.string().length(26),
  updatedAt: z.number().int().nonnegative(),
  _deleted: z.boolean(),
  envelope: encryptedEnvelopeSchema,
});

export const syncCheckpointSchema = z.object({ seq: z.number().int().nonnegative() });

/** `data` of POST /api/vault/pull. */
export const pullResponseSchema = z.object({
  documents: z.array(syncDocumentSchema),
  checkpoint: syncCheckpointSchema,
});

const countsSchema = z.object({
  created: z.number().int().nonnegative(),
  updated: z.number().int().nonnegative(),
  deleted: z.number().int().nonnegative(),
});

/** `data` of POST /api/vault/push. */
export const pushResponseSchema = z.object({
  conflicts: z.array(syncDocumentSchema),
  counts: countsSchema,
});

export const syncStatsSchema = z.object({
  sent: countsSchema,
  received: countsSchema,
  /** Epoch ms of the last time everything was in sync, or null before the first sync. */
  lastSyncedAt: z.number().int().nonnegative().nullable(),
});

export type SyncDocument = z.infer<typeof syncDocumentSchema>;
export type SyncCheckpoint = z.infer<typeof syncCheckpointSchema>;
export type SyncCounts = z.infer<typeof countsSchema>;
export type SyncStats = z.infer<typeof syncStatsSchema>;
