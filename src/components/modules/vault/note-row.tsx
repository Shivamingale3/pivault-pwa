import { ChevronRightIcon } from "lucide-react";
import { UnsyncedDot } from "@/components/modules/vault/sync-mark";
import type { NoteEntry } from "@/types/vault.types";

/** A note: its title and a chevron, with a hairline below (h ~56). */
export function NoteRow({
  entry,
  onOpen,
}: {
  entry: NoteEntry;
  onOpen: (entry: NoteEntry) => void;
}) {
  return (
    <li className="border-b border-border">
      <button
        type="button"
        onClick={() => {
          onOpen(entry);
        }}
        className="flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left outline-none focus-visible:bg-muted"
      >
        <span className="flex-1 truncate text-[0.9375rem] font-semibold">{entry.title}</span>
        <UnsyncedDot id={entry.id} updatedAt={entry.updatedAt} />
        <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 text-subtle" />
      </button>
    </li>
  );
}
