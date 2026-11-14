import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DARK_CLASS, THEME_STORAGE_KEY } from "@/constants/theme.constants";
import { installMatchMedia } from "@/test/match-media";
import script from "../../public/theme-init.js?raw";

/** public/theme-init.js runs before React (see index.html), so it is tested as a plain script. */
// Evaluated in the test's own global scope (jsdom's script runner can't see the matchMedia stub).
const runScript = () => {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call -- test-only: runs the file under test
  new Function(script)();
};
const themeColor = () =>
  document.querySelector('meta[name="theme-color"]')?.getAttribute("content");

beforeEach(() => {
  document.head.innerHTML = '<meta name="theme-color" content="#ffffff" />';
  document.documentElement.className = "";
  document.documentElement.style.colorScheme = "";
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("theme-init.js", () => {
  it("applies a stored dark theme before first paint", () => {
    installMatchMedia(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    runScript();
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(themeColor()).toBe("#101215");
  });

  it("applies a stored light theme even when the OS prefers dark", () => {
    installMatchMedia(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    runScript();
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false);
    expect(themeColor()).toBe("#ffffff");
  });

  it.each([
    [true, true],
    [false, false],
  ])("follows the OS (dark=%s) when nothing valid is stored", (prefersDark, expectDark) => {
    installMatchMedia(prefersDark);
    window.localStorage.setItem(THEME_STORAGE_KEY, "<script>");
    runScript();
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(expectDark);
  });

  it("falls back to the system theme when storage is unavailable", () => {
    installMatchMedia(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(runScript).not.toThrow();
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true);
  });
});
