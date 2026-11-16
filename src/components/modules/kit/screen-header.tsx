import { ChevronLeftIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import { cn } from "@/lib/utils";

/** A detail or editor screen's top row: back button on the left, actions or a chip on the right. */
export function ScreenHeader({ backTo, children }: { backTo: string; children?: ReactNode }) {
  return (
    <header className="flex animate-rise items-center justify-between gap-3">
      <Link
        to={backTo}
        aria-label={CRUD_COPY.back}
        className={cn(buttonVariants({ variant: "secondary", size: "icon-sm" }), "bg-muted")}
      >
        <ChevronLeftIcon />
      </Link>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
