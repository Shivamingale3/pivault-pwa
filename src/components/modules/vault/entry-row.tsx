import { KeyRoundIcon, NotebookTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryKind } from "@/enums/vault.enum";
import type { VaultEntry } from "@/types/vault.types";

const PREVIEW_LENGTH = 60;

/** One line under the title: the username or site for a password, the first line of a note. */
const subtitle = (entry: VaultEntry): string => {
  if (entry.kind === EntryKind.Password) return entry.username || entry.url;
  const firstLine = entry.body.split("\n").find((line) => line.trim() !== "") ?? "";
  return firstLine.slice(0, PREVIEW_LENGTH);
};

interface EntryRowProps {
  entry: VaultEntry;
  onOpen: (id: string) => void;
}

export function EntryRow({ entry, onOpen }: EntryRowProps) {
  const Icon = entry.kind === EntryKind.Password ? KeyRoundIcon : NotebookTextIcon;
  const detail = subtitle(entry);

  return (
    <Button
      variant="ghost"
      className="h-auto w-full justify-start gap-3.5 rounded-lg px-3 py-3 text-left font-semibold"
      onClick={() => {
        onOpen(entry.id);
      }}
    >
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted [&_svg]:size-5"
      >
        <Icon />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[0.9375rem]">{entry.title}</span>
        {detail && (
          <span className="truncate text-xs font-medium text-muted-foreground">{detail}</span>
        )}
      </span>
    </Button>
  );
}
