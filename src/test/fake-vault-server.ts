import type { SyncCheckpoint, SyncCounts, SyncDocument } from "@/schemas/sync.schema";
import type { PushRow } from "@/services/sync.api";

type Stored = SyncDocument & { seq: number };

const sameState = (a: SyncDocument, b: SyncDocument): boolean =>
  a.updatedAt === b.updatedAt &&
  a._deleted === b._deleted &&
  a.envelope.iv === b.envelope.iv &&
  a.envelope.ciphertext === b.envelope.ciphertext;

const strip = ({ seq: _seq, ...document }: Stored): SyncDocument => document;

/**
 * A stand-in for the backend's /api/vault endpoints with the same rules (change numbers, the
 * assumed-state conflict check, tombstones). It holds only what the real server would: opaque blobs.
 */
export class FakeVaultServer {
  readonly entries = new Map<string, Stored>();
  private seq = 0;
  pulls = 0;
  pushes = 0;

  pull(checkpoint: SyncCheckpoint | null, limit: number) {
    this.pulls += 1;
    const after = checkpoint?.seq ?? 0;
    const documents = [...this.entries.values()]
      .filter((entry) => entry.seq > after)
      .sort((a, b) => a.seq - b.seq)
      .slice(0, limit);
    const seq = documents.at(-1)?.seq ?? after;
    return {
      documents: documents.map(strip),
      checkpoint: { seq },
      remaining: [...this.entries.values()].filter((entry) => entry.seq > seq).length,
    };
  }

  push(rows: PushRow[]) {
    this.pushes += 1;
    const conflicts: SyncDocument[] = [];
    const counts: SyncCounts = { created: 0, updated: 0, deleted: 0 };
    for (const { assumedMasterState, newDocumentState } of rows) {
      const master = this.entries.get(newDocumentState.id);
      if (master && sameState(master, newDocumentState)) continue;
      if (master && !(assumedMasterState && sameState(master, assumedMasterState))) {
        conflicts.push(strip(master));
        continue;
      }
      this.put(newDocumentState);
      if (newDocumentState._deleted && !master?._deleted) counts.deleted += 1;
      else if (master) counts.updated += 1;
      else counts.created += 1;
    }
    return { conflicts, counts };
  }

  /** A change made by another device. */
  put(document: SyncDocument): void {
    this.seq += 1;
    this.entries.set(document.id, { ...structuredClone(document), seq: this.seq });
  }
}
