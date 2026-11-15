import { CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";

interface CopyButtonProps {
  value: string;
  label: string;
}

export function CopyButton({ value, label }: CopyButtonProps) {
  const copy = useCopy();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={`Copy ${label.toLowerCase()}`}
      onClick={() => void copy(value, label)}
    >
      <CopyIcon />
    </Button>
  );
}
