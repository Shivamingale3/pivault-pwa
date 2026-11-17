import type { RxCollection, WithDeleted } from "rxdb/plugins/core";
import type { SyncCheckpoint, SyncCounts, SyncDocument } from "@/schemas/sync.schema";
import { type PushRow, pullChanges, pushChanges } from "@/services/sync.api";
import { recordServerVersions } from "@/services/synced-state.service";
import type { VaultDocument } from "@/types/vault.types";

const NONE: SyncCounts = { created: 0, updated: 0, deleted: 0 };
const total = (counts: SyncCounts): number => counts.created + counts.updated + counts.deleted;
const fingerprint = (doc: SyncDocument): string =>
  `${doc.id}:${String(doc.updatedAt)}:${String(doc._deleted)}:${doc.envelope.iv}`;

/** Only these fields leave the device. Everything the user typed is inside the encrypted envelope. */
const toDocument = ({ id, updatedAt, _deleted, envelope }: SyncDocument): SyncDocument => ({
  id,
  updatedAt,
  _deleted,
  envelope: { ...envelope },
});

/** Received entries that are really new, changed or deleted here (not echoes of our own pushes). */
async function countReceived(
  collection: RxCollection<VaultDocument>,
  documents: SyncDocument[],
  echoes: Set<string>,
): Promise<SyncCounts> {
  const fresh = documents.filter((doc) => !echoes.delete(fingerprint(doc)));
  const existing = await collection.findByIds(fresh.map((doc) => doc.id)).exec();
  const counts = { ...NONE };
  for (const doc of fresh) {
    if (doc._deleted) counts.deleted += 1;
    else if (existing.has(doc.id)) counts.updated += 1;
    else counts.created += 1;
  }
  return counts;
}

/** Called with what was really transferred, so the totals can be kept. */
export interface TransferReports {
  received: (counts: SyncCounts) => Promise<void>;
  sent: (counts: SyncCounts) => Promise<void>;
  /** Each pulled page: how many entries it held and how many changes are still waiting. */
  page?: (info: { documents: number; remaining: number }) => void;
}

/**
 * RxDB's pull and push steps against the server. `echoes` remembers what we just pushed, so the
 * same entries coming back in the next pull are not counted as received.
 */
export function createTransfer(
  collection: RxCollection<VaultDocument>,
  reports: TransferReports,
  echoes = new Set<string>(),
) {
  const pull = async (checkpoint: SyncCheckpoint | undefined, batchSize: number) => {
    const response = await pullChanges(checkpoint ?? null, batchSize);
    const counts = await countReceived(collection, response.documents, echoes);
    await recordServerVersions(response.documents);
    if (total(counts) > 0) await reports.received(counts);
    reports.page?.({ documents: response.documents.length, remaining: response.remaining });
    return {
      documents: response.documents.map(toDocument) as WithDeleted<VaultDocument>[],
      checkpoint: response.checkpoint,
    };
  };

  const push = async (rows: { assumedMasterState?: unknown; newDocumentState: unknown }[]) => {
    const body: PushRow[] = rows.map((row) => ({
      assumedMasterState: row.assumedMasterState
        ? toDocument(row.assumedMasterState as SyncDocument)
        : null,
      newDocumentState: toDocument(row.newDocumentState as SyncDocument),
    }));
    const response = await pushChanges(body);
    const lost = new Set(response.conflicts.map((doc) => doc.id));
    for (const row of body) {
      if (!lost.has(row.newDocumentState.id)) echoes.add(fingerprint(row.newDocumentState));
    }
    await recordServerVersions(
      body.map((row) => row.newDocumentState).filter((doc) => !lost.has(doc.id)),
    );
    if (total(response.counts) > 0) await reports.sent(response.counts);
    return response.conflicts.map(toDocument) as WithDeleted<VaultDocument>[];
  };

  return { pull, push };
}
