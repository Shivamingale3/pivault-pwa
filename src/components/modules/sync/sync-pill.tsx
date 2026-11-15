import { WifiOffIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SYNC_COPY } from "@/constants/settings.constants";
import { useSync } from "@/hooks/use-sync";
import type { SyncStatus } from "@/interfaces/sync.interface";
import { cn } from "@/lib/utils";

const LABELS: Record<SyncStatus, string> = {
  syncing: SYNC_COPY.pillSyncing,
  synced: SYNC_COPY.pillSynced,
  offline: SYNC_COPY.pillOffline,
  error: SYNC_COPY.pillProblem,
  ended: SYNC_COPY.pillEnded,
};

const DOTS: Record<Exclude<SyncStatus, "offline">, string> = {
  syncing: "bg-subtle animate-pulse-soft",
  synced: "bg-success",
  error: "bg-destructive",
  ended: "bg-destructive",
};

/** The status chip under a header. Offline is a pill, never a screen. */
export function SyncPill() {
  const { status } = useSync();
  const failed = status === "error" || status === "ended";
  return (
    <Badge
      variant={failed ? "destructive" : "secondary"}
      role="status"
      aria-label={`Sync status: ${LABELS[status]}`}
      className={cn(
        "h-7.5 w-fit gap-2 px-3 text-[0.71875rem] font-semibold",
        !failed && "text-muted-foreground",
      )}
    >
      {status === "offline" ? (
        <WifiOffIcon aria-hidden="true" className="size-3.5" />
      ) : (
        <span aria-hidden="true" className={cn("size-1.5 rounded-full", DOTS[status])} />
      )}
      {LABELS[status]}
    </Badge>
  );
}
