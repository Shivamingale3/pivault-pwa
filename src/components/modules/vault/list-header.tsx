import type { ReactNode } from "react";
import { BackButton } from "@/components/modules/kit/back-button";

interface ListHeaderProps {
  title: string;
  meta: string;
  /** Where back goes when there is no earlier screen. */
  backTo: string;
  /** Replaces the usual back (the Passwords sort state leaves itself instead). */
  onBack?: () => void;
  /** The right-hand action (Sort pill, search button). */
  action?: ReactNode;
}

/** A list screen's back button, title (27/800), a meta line, and one action on the right. */
export function ListHeader({ title, meta, backTo, onBack, action }: ListHeaderProps) {
  return (
    <header className="flex animate-rise flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <BackButton fallback={backTo} onBack={onBack} />
        {action}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-display">{title}</h1>
        <p className="text-xs font-medium text-muted-foreground">{meta}</p>
      </div>
    </header>
  );
}
