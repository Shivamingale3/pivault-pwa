import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { Card } from "@/components/ui/card";
import { SYNC_COPY } from "@/constants/settings.constants";
import { useSync } from "@/hooks/use-sync";
import type { SyncStatus } from "@/interfaces/sync.interface";
import { cn } from "@/lib/utils";
import { formatRelative, formatWhen } from "@/utils/time.utils";

const STATUS_TEXT: Record<SyncStatus, string> = {
  synced: SYNC_COPY.upToDate,
  syncing: SYNC_COPY.syncing,
  offline: SYNC_COPY.offline,
  error: SYNC_COPY.problem,
  ended: SYNC_COPY.ended,
};

interface SyncStatusCardProps {
  /** True while a manual sync is running. */
  busy: boolean;
  onSync: () => void;
}

/** Status dot and word, how long ago it last finished, when and where, and the Sync now action. */
export function SyncStatusCard({ busy, onSync }: SyncStatusCardProps) {
  const { status, error, stats } = useSync();
  const last = stats.lastSyncedAt;
  const failed = status === "error" || status === "ended";

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={cn("size-1.5 rounded-full", failed ? "bg-destructive" : "bg-success")}
        />
        <p role="status" className="text-[0.8125rem] font-semibold">
          {STATUS_TEXT[status]}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[1.4375rem] leading-tight font-extrabold tracking-tight">
          {last === null ? SYNC_COPY.never : formatRelative(last)}
        </p>
        {last !== null && (
          <p className="text-[0.78125rem] font-medium text-muted-foreground">{formatWhen(last)}</p>
        )}
      </div>
      <FormErrorBanner message={failed ? error : null} />
      <PrimaryCta
        className="h-14"
        busy={busy}
        busyLabel={SYNC_COPY.busy}
        disabled={status === "ended"}
        onClick={onSync}
      >
        {SYNC_COPY.syncNow}
      </PrimaryCta>
    </Card>
  );
}
