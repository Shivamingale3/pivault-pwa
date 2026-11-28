import { KeyRoundIcon, NotebookTextIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HOME_COPY, LIST_COPY } from "@/constants/vault-design.constants";
import { EntryKind } from "@/enums/vault.enum";

interface HomeSwitchProps {
  notes: number;
  passwords: number;
}

/** A tile that picks the list: glyph tile, then the name and the count. The picked one is ink. */
function Tile({
  value,
  icon,
  title,
  count,
}: {
  value: EntryKind;
  icon: ReactNode;
  title: string;
  count: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="h-17 justify-start gap-3 rounded-[1.25rem] border-[1.5px] border-border bg-card px-3.5 text-left text-foreground transition-[background-color,color,transform] after:hidden hover:text-foreground active:scale-[0.985] dark:text-foreground dark:hover:text-foreground data-active:border-foreground data-active:bg-foreground data-active:text-background data-active:hover:text-background dark:data-active:border-foreground dark:data-active:bg-foreground dark:data-active:text-background dark:data-active:hover:text-background"
    >
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-[0.8125rem] bg-muted in-data-active:bg-background/15 [&_svg]:size-4.5"
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-px">
        <span className="truncate text-[0.9375rem] font-bold tracking-tight">{title}</span>
        <span className="truncate text-xs font-medium text-muted-foreground in-data-active:text-background/70">
          {count}
        </span>
      </span>
    </TabsTrigger>
  );
}

/** Notes and Passwords side by side: picking one shows its list underneath. */
export function HomeSwitch({ notes, passwords }: HomeSwitchProps) {
  return (
    <TabsList
      aria-label={HOME_COPY.show}
      className="grid h-auto w-full grid-cols-2 gap-2.5 rounded-none bg-transparent p-0 group-data-horizontal/tabs:h-auto"
    >
      <Tile
        value={EntryKind.Note}
        icon={<NotebookTextIcon />}
        title={HOME_COPY.notes}
        count={LIST_COPY.notesMeta(notes)}
      />
      <Tile
        value={EntryKind.Password}
        icon={<KeyRoundIcon />}
        title={HOME_COPY.passwords}
        count={LIST_COPY.passwordsMeta(passwords)}
      />
    </TabsList>
  );
}
