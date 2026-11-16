import type { ReactNode } from "react";

interface ListHeaderProps {
  title: string;
  meta: string;
  /** The right-hand action (Sort pill, search button). */
  action?: ReactNode;
}

/** A list screen's title (27/800), a meta line, and one action on the right. */
export function ListHeader({ title, meta, action }: ListHeaderProps) {
  return (
    <header className="flex animate-rise items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-display">{title}</h1>
        <p className="text-xs font-medium text-muted-foreground">{meta}</p>
      </div>
      {action}
    </header>
  );
}
