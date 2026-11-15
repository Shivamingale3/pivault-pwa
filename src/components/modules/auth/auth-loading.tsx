import { Skeleton } from "@/components/ui/skeleton";

/** Shown for a moment while the saved session is read from this device. */
export function AuthLoading() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-label="Loading PiVault"
      className="flex min-h-full w-full items-center justify-center bg-background"
    >
      <Skeleton className="size-13.5 rounded-lg" />
    </main>
  );
}
