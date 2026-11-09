import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

/** Toasts use the dark "secure surface" from the designs in both themes. */
const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme}
      position="top-center"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4.5 text-success" />,
        info: <InfoIcon className="size-4.5" />,
        warning: <TriangleAlertIcon className="size-4.5" />,
        error: <OctagonXIcon className="size-4.5 text-destructive" />,
        loading: <Loader2Icon className="size-4.5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "cn-toast gap-3! rounded-lg! border-0! bg-hero! px-4.5! py-4! font-sans! text-[0.84375rem]! font-semibold! text-hero-foreground! shadow-float!",
          description: "text-hero-foreground/60! font-medium!",
          actionButton: "rounded-full! bg-hero-foreground! text-hero! font-bold!",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
