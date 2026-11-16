import { CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";

interface CopyButtonProps {
  value: string;
  label: string;
}

/** The row copy button (44 px, bordered). Copies with a toast and the 30 second clipboard clear. */
export function CopyButton({ value, label }: CopyButtonProps) {
  const copy = useCopy();
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={`Copy ${label.toLowerCase()}`}
      onClick={() => void copy(value, label)}
    >
      <CopyIcon />
    </Button>
  );
}
