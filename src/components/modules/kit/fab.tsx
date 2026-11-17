import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FabProps {
  label: string;
  onClick: () => void;
}

/** The round add button: 56 px, ink, pinned to the bottom right of the screen. */
export function Fab({ label, onClick }: FabProps) {
  return (
    <Button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="sticky bottom-6 mt-auto size-14 shrink-0 self-end rounded-full p-0 shadow-float [&_svg]:size-6"
    >
      <PlusIcon aria-hidden="true" />
    </Button>
  );
}
