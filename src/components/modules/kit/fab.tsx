import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FabProps {
  label: string;
  onClick: () => void;
  /** Placement override, e.g. floating over a list that scrolls on its own. */
  className?: string;
}

/** The round add button: 56 px, ink, pinned to the bottom right of the screen. */
export function Fab({ label, onClick, className }: FabProps) {
  return (
    <Button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "sticky bottom-6 mt-auto size-14 shrink-0 self-end rounded-full p-0 shadow-float [&_svg]:size-6",
        className,
      )}
    >
      <PlusIcon aria-hidden="true" />
    </Button>
  );
}
