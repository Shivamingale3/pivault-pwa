import { Loader2Icon } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PrimaryCtaProps extends Omit<ComponentProps<typeof Button>, "size" | "variant"> {
  /** Shows a spinner and `busyLabel` instead of the children, and blocks further presses. */
  busy?: boolean;
  busyLabel?: string;
}

/** The full-width pill action pinned at the bottom of auth screens. */
export function PrimaryCta({
  busy = false,
  busyLabel,
  className,
  children,
  disabled,
  ...props
}: PrimaryCtaProps) {
  return (
    <Button
      size="xl"
      disabled={(disabled ?? false) || busy}
      aria-busy={busy}
      className={cn(
        "w-full shadow-float disabled:bg-muted disabled:text-subtle disabled:opacity-100 disabled:shadow-none",
        className,
      )}
      {...props}
    >
      {busy && <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />}
      {busy && busyLabel ? busyLabel : children}
    </Button>
  );
}
