import { Skeleton } from "@/components/ui/skeleton";

export function VaultLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Opening your vault"
      className="flex flex-col gap-3"
    >
      <Skeleton className="h-17 rounded-lg" />
      <Skeleton className="h-17 rounded-lg" />
      <Skeleton className="h-17 rounded-lg" />
    </div>
  );
}
