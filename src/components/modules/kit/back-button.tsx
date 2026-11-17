import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import { useBack } from "@/hooks/use-back";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /** Where to go when there is no earlier screen (the app was opened right here). */
  fallback: string;
  /** Replaces the usual "go back" (e.g. leaving the sort state of a list). */
  onBack?: () => void;
  label?: string;
  /** Canvas screens use a card-coloured button with a border. */
  onCanvas?: boolean;
}

/** The 44 px back button: returns to the previous screen, like the phone's back button. */
export function BackButton({
  fallback,
  onBack,
  label = CRUD_COPY.back,
  onCanvas = false,
}: BackButtonProps) {
  const back = useBack();
  return (
    <Button
      type="button"
      variant={onCanvas ? "outline" : "secondary"}
      size="icon-sm"
      aria-label={label}
      className={cn(onCanvas ? "border-border bg-card" : "bg-muted")}
      onClick={() => {
        if (onBack) onBack();
        else back(fallback);
      }}
    >
      <ChevronLeftIcon />
    </Button>
  );
}
