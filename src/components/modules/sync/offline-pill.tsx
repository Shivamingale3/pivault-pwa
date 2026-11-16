import { WifiOffIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SYNC_COPY } from "@/constants/settings.constants";
import { useSync } from "@/hooks/use-sync";

/** Offline is a pill under the header, never a screen. Shown only while there is no connection. */
export function OfflinePill() {
  const { status } = useSync();
  if (status !== "offline") return null;
  return (
    <Badge
      variant="secondary"
      role="status"
      aria-label={`Sync status: ${SYNC_COPY.pillOffline}`}
      className="h-7.5 w-fit gap-2 px-3 text-[0.71875rem] font-semibold text-muted-foreground"
    >
      <WifiOffIcon aria-hidden="true" className="size-3.5" />
      {SYNC_COPY.pillOffline}
    </Badge>
  );
}
