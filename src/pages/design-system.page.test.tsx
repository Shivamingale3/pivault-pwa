import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "@/App";
import { THEME_STORAGE_KEY } from "@/constants/theme.constants";

describe("Design system page (integration)", () => {
  it("renders every section", () => {
    render(<App />);
    for (const name of [
      "Warm neutrals, rust and teal",
      "Plus Jakarta Sans, mono for labels",
      "Pill buttons, one primary per screen",
      "Filled fields, ink on focus",
      "Status, cards and toasts",
      "Sheets when the user must choose",
    ]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument();
    }
  });

  it("switches to dark and back to light from the theme toggle", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Dark" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Light" }));
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<App />);
    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show" }));
    expect(password).toHaveAttribute("type", "text");
  });

  it("shows a toast when asked", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Show success toast" }));
    expect(await screen.findByText("Password copied")).toBeInTheDocument();
  });
});
