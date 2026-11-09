import { describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY } from "@/constants/theme.constants";
import { Theme } from "@/enums/theme.enum";
import {
  applyTheme,
  isTheme,
  readStoredTheme,
  resolveTheme,
  writeStoredTheme,
} from "@/utils/theme.utils";

describe("theme utils", () => {
  it("recognises only valid theme values", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(true);
    expect(isTheme("blue")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });

  it("resolves system against the OS preference", () => {
    expect(resolveTheme(Theme.System, true)).toBe(Theme.Dark);
    expect(resolveTheme(Theme.System, false)).toBe(Theme.Light);
    expect(resolveTheme(Theme.Light, true)).toBe(Theme.Light);
  });

  it("reads a stored theme and falls back on garbage", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(readStoredTheme(Theme.System)).toBe(Theme.Dark);
    window.localStorage.setItem(THEME_STORAGE_KEY, "<script>");
    expect(readStoredTheme(Theme.System)).toBe(Theme.System);
  });

  it("falls back when storage throws", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readStoredTheme(Theme.Light)).toBe(Theme.Light);
  });

  it("reports failed writes instead of throwing", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(writeStoredTheme(Theme.Dark)).toBe(false);
  });

  it("applies the dark class, colour scheme and theme-color meta", () => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);

    applyTheme(Theme.Dark);
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(meta.content).toBe("#101215");

    applyTheme(Theme.Light);
    expect(document.documentElement).not.toHaveClass("dark");
    expect(meta.content).toBe("#ffffff");
    meta.remove();
  });
});
