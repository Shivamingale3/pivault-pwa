import {
  DARK_CLASS,
  PREFERS_DARK_QUERY,
  THEME_COLOR,
  THEME_STORAGE_KEY,
} from "@/constants/theme.constants";
import { type ResolvedTheme, Theme } from "@/enums/theme.enum";

const THEME_VALUES: readonly string[] = Object.values(Theme);

export const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" && THEME_VALUES.includes(value);

/** Reads the stored preference; storage can be unavailable (private mode, blocked site data). */
export const readStoredTheme = (fallback: Theme): Theme => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : fallback;
  } catch (error) {
    console.warn("Theme preference could not be read; using the default.", error);
    return fallback;
  }
};

/** Persists the preference. Returns false when storage is unavailable so callers can react. */
export const writeStoredTheme = (theme: Theme): boolean => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch (error) {
    console.warn("Theme preference could not be saved.", error);
    return false;
  }
};

export const systemPrefersDark = (): boolean =>
  typeof window.matchMedia === "function" && window.matchMedia(PREFERS_DARK_QUERY).matches;

export const resolveTheme = (theme: Theme, prefersDark: boolean): ResolvedTheme => {
  if (theme === Theme.System) return prefersDark ? Theme.Dark : Theme.Light;
  return theme;
};

/** Paints the resolved theme on <html> and syncs the browser chrome colour. */
export const applyTheme = (
  resolved: ResolvedTheme,
  root: HTMLElement = document.documentElement,
) => {
  root.classList.toggle(DARK_CLASS, resolved === Theme.Dark);
  root.style.colorScheme = resolved;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[resolved]);
};
