import { HOME_COPY } from "@/constants/vault-design.constants";
import type { StorageEstimate } from "@/hooks/use-storage-estimate";
import { formatBytes } from "@/utils/bytes-format.utils";

/** The dashed card: how much space the vault uses on this phone, with a thin bar. */
export function StorageCard({ estimate }: { estimate: StorageEstimate | null }) {
  const share = estimate && estimate.quota > 0 ? (estimate.usage / estimate.quota) * 100 : 0;
  return (
    <div className="flex min-h-24 flex-col justify-between gap-3 rounded-[1.25rem] border-[1.5px] border-dashed border-border p-4">
      <p className="text-eyebrow">{HOME_COPY.onThisPhone}</p>
      <div className="flex flex-col gap-2">
        <p className="text-[1.0625rem] font-bold tracking-tight">
          {estimate ? formatBytes(estimate.usage) : "—"}
        </p>
        <div
          role="progressbar"
          aria-label="Space used on this phone"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(share)}
          className="h-1 rounded-full bg-border"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${String(Math.min(100, Math.max(share, 2)))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
