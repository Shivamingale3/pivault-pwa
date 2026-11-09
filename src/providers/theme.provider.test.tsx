import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY } from "@/constants/theme.constants";
import { Theme } from "@/enums/theme.enum";
import { useTheme } from "@/hooks/use-theme";
import { ThemeProvider } from "@/providers/theme.provider";
import { installMatchMedia, setSystemDark } from "@/test/match-media";

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

function Probe() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => {
        setTheme(Theme.Dark);
      }}
    >
      {theme}:{resolvedTheme}
    </button>
  );
}

describe("ThemeProvider", () => {
  it("defaults to system and follows the OS preference", () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe(Theme.System);
    expect(result.current.resolvedTheme).toBe(Theme.Dark);
    expect(document.documentElement).toHaveClass("dark");
  });

  it("reacts when the OS scheme changes while on system", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.resolvedTheme).toBe(Theme.Light);
    act(() => {
      setSystemDark(true);
    });
    expect(result.current.resolvedTheme).toBe(Theme.Dark);
  });

  it("restores a saved preference", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, Theme.Dark);
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe(Theme.Dark);
  });

  it("persists and paints an explicit choice", async () => {
    render(<Probe />, { wrapper });
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("dark:dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(Theme.Dark);
    expect(document.documentElement).toHaveClass("dark");
  });

  it("still switches theme when storage is unavailable", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(<Probe />, { wrapper });
    await userEvent.click(screen.getByRole("button"));
    expect(document.documentElement).toHaveClass("dark");
  });

  it("throws a clear error outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useTheme())).toThrow(/within a ThemeProvider/);
  });
});
