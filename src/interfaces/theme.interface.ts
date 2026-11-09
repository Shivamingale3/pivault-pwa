import type { ResolvedTheme, Theme } from "@/enums/theme.enum";

export interface ThemeContextValue {
  /** The stored preference, which may be `system`. */
  theme: Theme;
  /** What is currently painted: `light` or `dark`. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}
