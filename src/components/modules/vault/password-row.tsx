import { EyeIcon, EyeOffIcon, CopyIcon } from "lucide-react";
import { RowAvatar } from "@/components/modules/vault/row-avatar";
import { Button } from "@/components/ui/button";
import { LIST_COPY } from "@/constants/vault-design.constants";
import type { PasswordEntry } from "@/types/vault.types";

const BULLETS = "•••••••••••";

interface PasswordRowProps {
  entry: PasswordEntry;
  revealed: boolean;
  onOpen: (entry: PasswordEntry) => void;
  onToggleReveal: (entry: PasswordEntry) => void;
  onCopy: (entry: PasswordEntry) => void;
}

/** Avatar, title, username and the secret in mono (bullets until revealed), then eye and copy (44 px each). */
export function PasswordRow({ entry, revealed, onOpen, onToggleReveal, onCopy }: PasswordRowProps) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <RowAvatar title={entry.title} />
      <button
        type="button"
        aria-label={entry.title}
        onClick={() => {
          onOpen(entry);
        }}
        className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="truncate text-[0.9375rem] font-bold tracking-tight">{entry.title}</span>
        {entry.username && (
          <span className="truncate text-[0.78125rem] font-medium text-muted-foreground">
            {entry.username}
          </span>
        )}
        <span aria-hidden={!revealed} className="truncate font-mono text-[0.8125rem] font-semibold">
          {revealed ? entry.password : BULLETS}
        </span>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={
          revealed ? `${LIST_COPY.hide}: ${entry.title}` : `${LIST_COPY.reveal}: ${entry.title}`
        }
        aria-pressed={revealed}
        onClick={() => {
          onToggleReveal(entry);
        }}
      >
        {revealed ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={`${LIST_COPY.copy}: ${entry.title}`}
        onClick={() => {
          onCopy(entry);
        }}
      >
        <CopyIcon />
      </Button>
    </li>
  );
}
