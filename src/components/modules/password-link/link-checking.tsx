import { AuthScreenLayout } from "@/components/modules/auth/auth-screen-layout";
import { Skeleton } from "@/components/ui/skeleton";

/** Shown while the API confirms the emailed link is still usable. */
export function LinkChecking() {
  return (
    <AuthScreenLayout title="Checking your link">
      <div
        role="status"
        aria-busy="true"
        aria-label="Checking your link"
        className="flex flex-col gap-4"
      >
        <Skeleton className="h-14.5 rounded-lg" />
        <Skeleton className="h-14.5 rounded-lg" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </AuthScreenLayout>
  );
}
