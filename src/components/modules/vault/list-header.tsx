import { ChevronLeftIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import { cn } from "@/lib/utils";

interface ListHeaderProps {
  title: string;
  meta: string;
  /** Where the back button goes (home, or out of the sort state). */
  backTo: string;
  /** The right-hand action (Sort pill, search button). */
  action?: ReactNode;
}

/** A list screen's back button, title (27/800), a meta line, and one action on the right. */
export function ListHeader({ title, meta, backTo, action }: ListHeaderProps) {
  return (
    <header className="flex animate-rise flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          to={backTo}
          aria-label={CRUD_COPY.back}
          className={cn(buttonVariants({ variant: "secondary", size: "icon-sm" }), "bg-muted")}
        >
          <ChevronLeftIcon />
        </Link>
        {action}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-display">{title}</h1>
        <p className="text-xs font-medium text-muted-foreground">{meta}</p>
      </div>
    </header>
  );
}
