import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-transparent bg-clip-padding font-bold tracking-tight whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        outline: "border-border-strong bg-background text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted aria-expanded:bg-muted",
        destructive: "bg-destructive text-primary-foreground hover:bg-destructive/90",
        "destructive-soft":
          "bg-destructive-surface text-destructive-foreground hover:bg-destructive-surface/70",
        link: "h-auto px-1 text-foreground underline underline-offset-3 hover:text-foreground/80",
      },
      size: {
        default: "h-13 gap-2 px-6 text-sm",
        lg: "h-14 gap-2 px-7 text-[0.9375rem]",
        xl: "h-15 gap-2.5 px-8 text-base",
        sm: "h-11 gap-1.5 rounded-md px-4 text-[0.8125rem]",
        xs: "h-8 gap-1 px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-13",
        "icon-sm": "size-11 rounded-md",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
