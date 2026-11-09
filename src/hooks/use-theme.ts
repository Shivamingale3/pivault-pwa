import { use } from "react";
import { ThemeContext } from "@/contexts/theme.context";
import type { ThemeContextValue } from "@/interfaces/theme.interface";

export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return context;
}
