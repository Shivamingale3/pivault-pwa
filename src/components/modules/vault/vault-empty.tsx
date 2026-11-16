interface VaultEmptyProps {
  filtering: boolean;
  /** Overrides the "No matches" heading (e.g. an empty Weak tab). */
  title?: string;
  body?: string;
}

/** Nothing matches the current search / filter. */
export function VaultEmpty({ filtering, title, body }: VaultEmptyProps) {
  return (
    <div
      role="status"
      className="flex flex-1 flex-col items-center justify-center gap-2 text-center"
    >
      <p className="text-base font-bold">
        {title ?? (filtering ? "No matches" : "Nothing here yet")}
      </p>
      <p className="max-w-64 text-sm font-medium text-pretty text-muted-foreground">
        {body ?? (filtering ? "Try a different search or filter." : "Nothing to show here yet.")}
      </p>
    </div>
  );
}
