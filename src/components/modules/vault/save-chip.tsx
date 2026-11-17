import { StatusChip } from "@/components/modules/kit/status-chip";
import { SYNC_MARK_COPY } from "@/constants/vault-design.constants";
import type { SaveStatus } from "@/hooks/use-autosave";
import { useSyncedState } from "@/hooks/use-synced";
import { useVault } from "@/hooks/use-vault";

/** An editor's chip: "Saving…" while a change is pending, then whether the item is synced. */
export function SaveChip({ status, id }: { status: SaveStatus; id: string | null }) {
  const { entries } = useVault();
  const { synced } = useSyncedState();
  if (status === "saving") return <StatusChip busy>{SYNC_MARK_COPY.saving}</StatusChip>;
  if (status === "error") return <StatusChip pending>{SYNC_MARK_COPY.saveFailed}</StatusChip>;
  // Nothing typed yet, or the form can't be saved as it stands (e.g. no name).
  if (status === "idle") return <StatusChip pending>{SYNC_MARK_COPY.notSaved}</StatusChip>;
  const entry = id ? entries.find((candidate) => candidate.id === id) : undefined;
  if (!entry) return <StatusChip pending>{SYNC_MARK_COPY.notSaved}</StatusChip>;
  const done = synced(entry.id, entry.updatedAt);
  return (
    <StatusChip pending={!done}>
      {done ? SYNC_MARK_COPY.synced : SYNC_MARK_COPY.notSynced}
    </StatusChip>
  );
}
