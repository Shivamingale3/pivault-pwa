import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full resize-none rounded-lg border-[1.5px] border-transparent bg-muted px-4.5 py-4 text-[0.9375rem] leading-relaxed font-medium text-foreground transition-colors outline-none placeholder:text-subtle focus-visible:border-foreground focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
