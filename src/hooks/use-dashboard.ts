import { useMemo } from "react";
import { useNavigate } from "react-router";
import { EntryKind } from "@/enums/vault.enum";
import { useSession } from "@/hooks/use-session";
import { useStorageEstimate } from "@/hooks/use-storage-estimate";
import { useUsage } from "@/hooks/use-usage";
import { useVault } from "@/hooks/use-vault";
import { entryPath } from "@/routes/route-paths";

export interface RecentItem {
  id: string;
  kind: EntryKind;
  title: string;
  at: number;
}

const RECENT_LIMIT = 5;

/** Everything the dashboard shows: the name, the counts, recently opened items and the storage used. */
export function useDashboard() {
  const session = useSession();
  const { entries } = useVault();
  const { usage, clear } = useUsage();
  const storage = useStorageEstimate();
  const navigate = useNavigate();

  const recents = useMemo<RecentItem[]>(
    () =>
      entries
        .flatMap((entry) => {
          const used = usage[entry.id];
          return used ? [{ id: entry.id, kind: entry.kind, title: entry.title, at: used.at }] : [];
        })
        .sort((a, b) => b.at - a.at)
        .slice(0, RECENT_LIMIT),
    [entries, usage],
  );

  const passwords = entries.filter((entry) => entry.kind === EntryKind.Password).length;

  return {
    firstName: session?.firstName ?? "",
    passwords,
    notes: entries.length - passwords,
    recents,
    storage,
    clearRecents: clear,
    /** Opens the item's own screen. */
    openRecent: (item: RecentItem) => {
      void navigate(
        item.kind === EntryKind.Password ? entryPath.password(item.id) : entryPath.note(item.id),
      );
    },
  };
}
