import { ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

interface SettingsRowProps {
  title: string;
  meta?: string;
  icon?: ReactNode;
  /** Navigates when given; otherwise the row is a button that calls `onClick`. */
  to?: string;
  onClick?: () => void;
  destructive?: boolean;
}

const ROW =
  "flex min-h-16.5 w-full items-center gap-3.5 px-4 py-3 text-left outline-none focus-visible:bg-muted [&_svg]:size-4 [&_svg]:shrink-0";

/** A settings row: icon, title 14.5/700, meta 12/500 muted, chevron. At least 44 px tall. */
export function SettingsRow({ title, meta, icon, to, onClick, destructive }: SettingsRowProps) {
  const content = (
    <>
      {icon}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "text-[0.90625rem] font-bold tracking-tight",
            destructive && "text-destructive-foreground",
          )}
        >
          {title}
        </span>
        {meta && <span className="text-xs font-medium text-muted-foreground">{meta}</span>}
      </span>
      {!destructive && <ChevronRightIcon aria-hidden="true" className="text-subtle" />}
    </>
  );
  return to ? (
    <Link to={to} className={ROW}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={ROW}>
      {content}
    </button>
  );
}
