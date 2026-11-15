import { pullResponseSchema, pushResponseSchema } from "@/schemas/sync.schema";
import type { SyncCheckpoint, SyncDocument } from "@/schemas/sync.schema";
import { postSigned } from "@/services/signed-api.client";

/** One row of a push: what this device believes the server holds, and the new state. */
export interface PushRow {
  assumedMasterState: SyncDocument | null;
  newDocumentState: SyncDocument;
}

/** Changes after `checkpoint` (null = from the beginning). Encrypted blobs only. */
export const pullChanges = (
  checkpoint: SyncCheckpoint | null,
  limit: number,
  signal?: AbortSignal,
) => postSigned("/vault/pull", { checkpoint, limit }, pullResponseSchema, { signal });

/** Sends local changes. The reply lists entries that lost a conflict, with the server's version. */
export const pushChanges = (rows: PushRow[], signal?: AbortSignal) =>
  postSigned("/vault/push", { rows }, pushResponseSchema, { signal });
