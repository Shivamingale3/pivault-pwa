import { SearchIcon } from "lucide-react";
import { Link } from "react-router";
import { HOME_COPY } from "@/constants/vault-design.constants";
import { ROUTES } from "@/routes/route-paths";

/** A button shaped like a search field: it opens the Search screen. */
export function SearchPill() {
  return (
    <Link
      to={ROUTES.search}
      className="flex h-13.5 min-w-0 flex-1 items-center gap-3 rounded-full border-[1.5px] border-border bg-card px-4.5 text-[0.90625rem] font-medium text-muted-foreground shadow-[0_4px_14px_--alpha(var(--color-foreground)/4%)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <SearchIcon aria-hidden="true" className="size-4.25 shrink-0" />
      <span className="truncate">{HOME_COPY.search}</span>
    </Link>
  );
}
