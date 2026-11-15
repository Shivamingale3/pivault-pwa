interface VaultEmptyProps {
  filtering: boolean;
}

/** Nothing saved yet, or nothing matches the current search / filter. */
export function VaultEmpty({ filtering }: VaultEmptyProps) {
  return (
    <div
      role="status"
      className="flex flex-1 flex-col items-center justify-center gap-2 text-center"
    >
      <p className="text-base font-bold">{filtering ? "No matches" : "Nothing here yet"}</p>
      <p className="max-w-64 text-sm font-medium text-pretty text-muted-foreground">
        {filtering
          ? "Try a different search or filter."
          : "Add a password or a note. Everything is encrypted on this device before it is saved."}
      </p>
    </div>
  );
}
