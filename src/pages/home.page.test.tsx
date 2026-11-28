import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EntryKind } from "@/enums/vault.enum";
import { ROUTES } from "@/routes/route-paths";
import { clearUnlockedKey } from "@/services/secure-memory.service";
import { addEntry } from "@/services/vault.service";
import { fakeSecret } from "@/test/fake-secret";
import { freshIndexedDbPerTest } from "@/test/indexed-db";
import { renderUnlocked, unlockVaultForTest } from "@/test/vault-screens";

freshIndexedDbPerTest();

const login = (title: string) =>
  ({
    kind: EntryKind.Password,
    title,
    username: "j",
    password: fakeSecret(),
    url: "",
    notes: "",
  }) as const;

beforeEach(unlockVaultForTest);
afterEach(() => {
  clearUnlockedKey();
  vi.restoreAllMocks();
});

describe("home dashboard", () => {
  it("adds a password or a note from the + button", async () => {
    renderUnlocked(ROUTES.home);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Add" }));
    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByText("Add new")).toBeInTheDocument();
    await user.click(within(sheet).getByRole("button", { name: "Note" }));
    expect(await screen.findByRole("textbox", { name: "Title" })).toBeInTheDocument();
  });

  it("keeps the choices apart from the Add heading, in the sheet's own footer spacing", async () => {
    renderUnlocked(ROUTES.home);
    await userEvent.setup().click(await screen.findByRole("button", { name: "Add" }));
    const sheet = await screen.findByRole("dialog");
    const footer = sheet.querySelector('[data-slot="drawer-footer"]');
    // The shared footer carries the top spacing under the title; the buttons live inside it.
    expect(footer).not.toBeNull();
    expect(footer).toHaveClass("pt-6");
    expect(
      within(footer as HTMLElement)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Password", "Note", "Cancel"]);
  });

  it("opens a new password from the + button", async () => {
    renderUnlocked(ROUTES.home);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Add" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Password" }),
    );
    expect(await screen.findByLabelText("NAME")).toBeInTheDocument();
  });

  it("has no tab bar, and the user's initial opens Settings", async () => {
    renderUnlocked(ROUTES.home);
    const settings = await screen.findByRole("link", { name: "Settings" });
    expect(settings).toHaveAttribute("href", ROUTES.settings);
    await waitFor(() => {
      expect(settings).toHaveTextContent("J");
    });
    expect(screen.queryByRole("navigation", { name: "Main" })).toBeNull();
  });

  it("puts search and the Notes / Passwords switch on top, with the counts", async () => {
    await addEntry(login("Bank"));
    await addEntry(login("Mail"));
    await addEntry({ kind: EntryKind.Note, title: "Wifi", body: "x" });
    renderUnlocked(ROUTES.home);

    expect(await screen.findByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Search passwords, notes" })).toHaveAttribute(
      "href",
      ROUTES.search,
    );
    const tabs = within(screen.getByRole("tablist", { name: "Show" }));
    await waitFor(() => {
      expect(tabs.getByRole("tab", { name: /Passwords/ })).toHaveTextContent("2 items");
    });
    expect(tabs.getByRole("tab", { name: /Notes/ })).toHaveTextContent("1 note");
    expect(screen.queryByText(/Hello|Recently opened|Media/i)).toBeNull();
  });

  it("shows every note first, and swaps to the passwords on tapping Passwords", async () => {
    await addEntry(login("Bank"));
    await addEntry({ kind: EntryKind.Note, title: "Wifi", body: "x" });
    await addEntry({ kind: EntryKind.Note, title: "Visa", body: "y" });
    renderUnlocked(ROUTES.home);
    const user = userEvent.setup();

    const notesTab = await screen.findByRole("tab", { name: /Notes/ });
    expect(notesTab).toHaveAttribute("aria-selected", "true");
    const notes = await screen.findByRole("list", { name: "Notes" });
    expect(
      within(notes)
        .getAllByRole("listitem")
        .map((row) => row.textContent),
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("Wifi"), expect.stringContaining("Visa")]),
    );
    expect(screen.queryByRole("list", { name: "Passwords" })).toBeNull();

    await user.click(screen.getByRole("tab", { name: /Passwords/ }));
    const passwords = await screen.findByRole("list", { name: "Passwords" });
    expect(within(passwords).getByRole("button", { name: "Bank" })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Notes" })).toBeNull();
    expect(screen.getByRole("tab", { name: /Passwords/ })).toHaveAttribute("aria-selected", "true");
  });

  it("keeps passwords hidden in the list until revealed", async () => {
    await addEntry(login("Bank"));
    renderUnlocked({ pathname: ROUTES.home, search: "?show=password" });
    const list = await screen.findByRole("list", { name: "Passwords" });
    expect(within(list).getByText("•••••••••••")).toBeInTheDocument();
    await userEvent
      .setup()
      .click(within(list).getByRole("button", { name: "Show password: Bank" }));
    expect(within(list).queryByText("•••••••••••")).toBeNull();
  });

  it("opens the list named in the address, so coming back shows the same one", async () => {
    await addEntry(login("Bank"));
    renderUnlocked({ pathname: ROUTES.home, search: "?show=password" });
    expect(await screen.findByRole("tab", { name: /Passwords/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.setup().click(
      within(await screen.findByRole("list", { name: "Passwords" })).getByRole("button", {
        name: "Bank",
      }),
    );
    expect(await screen.findByText("PASSWORD")).toBeInTheDocument();
  });

  it("shows the empty state of the picked list", async () => {
    renderUnlocked(ROUTES.home);
    expect(await screen.findByText("No notes yet")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("tab", { name: /Passwords/ }));
    expect(await screen.findByText("No passwords yet")).toBeInTheDocument();
  });

  it("falls back to Notes for an unknown list in the address", async () => {
    renderUnlocked({ pathname: ROUTES.home, search: "?show=media" });
    expect(await screen.findByRole("tab", { name: /Notes/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
