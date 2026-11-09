import { LOGO_SRC } from "@/constants/theme.constants";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  /**
   * `auto` follows the active theme via CSS (no flash, no JS).
   * `light` / `dark` force the mark for a fixed surface, e.g. the always-dark hero card.
   */
  surface?: "auto" | "light" | "dark";
  /** Set when the product name is already shown next to the mark. */
  decorative?: boolean;
}

export function AppLogo({ className, surface = "auto", decorative = false }: AppLogoProps) {
  const alt = decorative ? "" : "PiVault";

  if (surface !== "auto") {
    return <img src={LOGO_SRC[surface]} alt={alt} className={cn("size-10", className)} />;
  }

  return (
    <>
      <img src={LOGO_SRC.light} alt={alt} className={cn("size-10 dark:hidden", className)} />
      <img src={LOGO_SRC.dark} alt={alt} className={cn("hidden size-10 dark:block", className)} />
    </>
  );
}
