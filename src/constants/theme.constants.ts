import { Theme } from "@/enums/theme.enum";

/** localStorage key for the theme preference (non-sensitive UI setting). */
export const THEME_STORAGE_KEY = "pivault:theme";

export const DEFAULT_THEME: Theme = Theme.System;

export const DARK_CLASS = "dark";

export const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

/** Browser chrome colour per theme; mirrors --background in styles/tokens.css. */
export const THEME_COLOR = {
  light: "#ffffff",
  dark: "#101215",
} as const;

/** Brand marks: ink logo for light surfaces, cream logo for dark surfaces. */
export const LOGO_SRC = {
  light: "/brand/logo-light.png",
  dark: "/brand/logo-dark.png",
} as const;
