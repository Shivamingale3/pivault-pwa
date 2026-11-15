import type { RxConflictHandler, WithDeleted } from "rxdb/plugins/core";
import type { VaultDocument } from "@/types/vault.types";

type Doc = WithDeleted<VaultDocument>;

const same = (a: Doc, b: Doc): boolean =>
  a.updatedAt === b.updatedAt &&
  a._deleted === b._deleted &&
  a.envelope.iv === b.envelope.iv &&
  a.envelope.ciphertext === b.envelope.ciphertext;

/**
 * Two devices changed the same entry: the later change wins (by `updatedAt`), edits and deletes
 * alike. A tie goes to the server's version, so every device ends on the same state. The server
 * can't read the blobs, so it can't merge fields: the whole entry is replaced.
 */
export const lastWriteWins: RxConflictHandler<VaultDocument> = {
  isEqual: same,
  resolve: ({ newDocumentState, realMasterState }) =>
    Promise.resolve(
      newDocumentState.updatedAt > realMasterState.updatedAt ? newDocumentState : realMasterState,
    ),
};
