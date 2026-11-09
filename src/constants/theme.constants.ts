import { Theme } from "@/enums/theme.enum";

/** localStorage key for the theme preference (non-sensitive UI setting). */
export const THEME_STORAGE_KEY = "pivault:theme";

export const DEFAULT_THEME: Theme = Theme.System;

export const DARK_CLASS = "dark";

export const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";
