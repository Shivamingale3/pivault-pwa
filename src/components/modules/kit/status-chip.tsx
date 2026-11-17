import { cn } from "@/lib/utils";

interface StatusChipProps {
  children: string;
  /** Stretches across the screen (the pinned footer chip). */
  wide?: boolean;
  /** The dot pulses while something is in progress. */
  busy?: boolean;
  /** Not done yet: a muted dot instead of the success one. */
  pending?: boolean;
}

/** The pill with a success dot: "Saved just now". Announced politely when its text changes. */
export function StatusChip({
  children,
  wide = false,
  busy = false,
  pending = false,
}: StatusChipProps) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 rounded-full bg-muted text-[0.71875rem] font-semibold text-muted-foreground",
        wide ? "w-full px-4 py-3" : "w-fit px-3 py-2",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          pending ? "bg-muted-foreground" : "bg-success",
          busy && "animate-pulse-soft",
        )}
      />
      {children}
    </p>
  );
}
