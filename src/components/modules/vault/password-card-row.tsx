import { RowAvatar } from "@/components/modules/vault/row-avatar";
import type { PasswordEntry } from "@/types/vault.types";
import { formatLastUsed } from "@/utils/last-used.utils";

interface PasswordCardRowProps {
  entry: PasswordEntry;
  /** When it was last used, or null when it never was. */
  lastUsedAt: number | null;
  onOpen: (entry: PasswordEntry) => void;
}

/** The sort state's row: a card with avatar, title, username and the mono "2H AGO" on the right. */
export function PasswordCardRow({ entry, lastUsedAt, onOpen }: PasswordCardRowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => {
          onOpen(entry);
        }}
        className="flex w-full items-center gap-3 rounded-[1.25rem] border-[1.5px] border-border bg-card p-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RowAvatar title={entry.title} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[0.9375rem] font-bold tracking-tight">{entry.title}</span>
          {entry.username && (
            <span className="truncate text-[0.78125rem] font-medium text-muted-foreground">
              {entry.username}
            </span>
          )}
        </span>
        {lastUsedAt !== null && (
          <span className="shrink-0 font-mono text-[0.625rem] font-bold tracking-wider text-subtle">
            {formatLastUsed(lastUsedAt)}
          </span>
        )}
      </button>
    </li>
  );
}
