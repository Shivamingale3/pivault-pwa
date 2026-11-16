import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NoteProps {
  children: ReactNode;
  className?: string;
}

/** A quiet explanation: radius 16, muted fill, info icon, 12/500 text. */
export function InfoNote({ children, className }: NoteProps) {
  return (
    <p
      className={cn(
        "flex items-start gap-2.5 rounded-2xl bg-muted px-3.5 py-3 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      <InfoIcon aria-hidden="true" className="mt-px size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** A warning the user must read: destructive surface, triangle icon. */
export function WarningBlock({ children, className }: NoteProps) {
  return (
    <p
      className={cn(
        "flex items-start gap-2.5 rounded-2xl bg-destructive-surface p-3.5 text-xs font-semibold text-destructive-foreground",
        className,
      )}
    >
      <TriangleAlertIcon aria-hidden="true" className="mt-px size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
