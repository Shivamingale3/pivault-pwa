import { KeyRoundIcon, NotebookTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HOME_COPY } from "@/constants/vault-design.constants";
import { EntryKind } from "@/enums/vault.enum";
import type { RecentItem } from "@/hooks/use-dashboard";
import { formatOpened } from "@/utils/time.utils";

interface RecentsSectionProps {
  items: RecentItem[];
  onOpen: (item: RecentItem) => void;
  onClear: () => void;
}

/** "RECENTLY OPENED" with a Clear action, then rows: glyph tile, title, and when it was opened. */
export function RecentsSection({ items, onOpen, onClear }: RecentsSectionProps) {
  if (items.length === 0) return null;
  return (
    <section aria-label="Recently opened" className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-eyebrow">{HOME_COPY.recent}</h2>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onClear}
          className="text-muted-foreground"
        >
          {HOME_COPY.clear}
        </Button>
      </div>
      <ul>
        {items.map((item) => {
          const Icon = item.kind === EntryKind.Password ? KeyRoundIcon : NotebookTextIcon;
          const when = formatOpened(item.at);
          return (
            <li key={item.id}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onOpen(item);
                }}
                className="h-auto w-full justify-start gap-3 rounded-xl px-1 py-2.5 text-left"
              >
                <span
                  aria-hidden="true"
                  className="flex size-8.5 shrink-0 items-center justify-center rounded-[0.6875rem] bg-muted [&_svg]:size-4"
                >
                  <Icon />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold">{item.title}</span>
                  <span className="text-[0.71875rem] font-medium text-muted-foreground">
                    {item.kind === EntryKind.Password
                      ? HOME_COPY.openedPassword(when)
                      : HOME_COPY.openedNote(when)}
                  </span>
                </span>
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
