import { EllipsisVerticalIcon } from "lucide-react";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import { cn } from "@/lib/utils";

/** The "Edit" pill and the overflow button on the right of a detail header. */
export function DetailActions({ editTo, onMore }: { editTo: string; onMore: () => void }) {
  return (
    <>
      <Link
        to={editTo}
        state={{ fromView: true }}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-full border-border",
        )}
      >
        {CRUD_COPY.edit}
      </Link>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={CRUD_COPY.more}
        className="border-border"
        onClick={onMore}
      >
        <EllipsisVerticalIcon />
      </Button>
    </>
  );
}
