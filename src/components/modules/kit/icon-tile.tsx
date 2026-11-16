import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IconTileProps {
  children: ReactNode;
  /** Failure variant: destructive surface and icon. */
  destructive?: boolean;
  className?: string;
}

/** The 54 px icon tile above a screen title (radius 19, 1.5 border). */
export function IconTile({ children, destructive = false, className }: IconTileProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-13.5 shrink-0 items-center justify-center rounded-[1.1875rem] border-[1.5px] [&_svg]:size-6",
        destructive
          ? "border-transparent bg-destructive-surface text-destructive"
          : "border-border bg-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
