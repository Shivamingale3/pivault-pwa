import { StatusChip } from "@/components/modules/kit/status-chip";
import { SYNC_MARK_COPY } from "@/constants/vault-design.constants";
import { useSyncedState } from "@/hooks/use-synced";

interface SyncMarkProps {
  id: string;
  updatedAt: number;
}

/** The pinned chip on a detail screen: whether this item is on the server yet. */
export function SyncChip({ id, updatedAt }: SyncMarkProps) {
  const { synced } = useSyncedState();
  const done = synced(id, updatedAt);
  return (
    <StatusChip wide pending={!done}>
      {done ? SYNC_MARK_COPY.synced : SYNC_MARK_COPY.notSynced}
    </StatusChip>
  );
}

/** A small dot at the end of a list row while the item has changes the server doesn't have yet. */
export function UnsyncedDot({ id, updatedAt }: SyncMarkProps) {
  const { synced } = useSyncedState();
  if (synced(id, updatedAt)) return null;
  return (
    <span
      role="img"
      aria-label={SYNC_MARK_COPY.notSynced}
      className="size-1.5 shrink-0 rounded-full bg-muted-foreground"
    />
  );
}
