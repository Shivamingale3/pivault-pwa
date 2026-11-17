import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EntryKind } from "@/enums/vault.enum";
import { ROUTES } from "@/routes/route-paths";
import { clearUnlockedKey } from "@/services/secure-memory.service";
import { recordUse } from "@/services/usage.service";
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
  Reflect.deleteProperty(navigator, "storage");
});

describe("home dashboard", () => {
  it("greets the user and shows the counts, with links to each list and to search", async () => {
    await addEntry(login("Bank"));
    await addEntry(login("Mail"));
    await addEntry({ kind: EntryKind.Note, title: "Wifi", body: "x" });
    renderUnlocked(ROUTES.home);

    expect(await screen.findByRole("heading", { name: "Hello, Jane" })).toBeInTheDocument();
    expect(screen.getByText("VAULT UNLOCKED")).toBeInTheDocument();
    const main = within(await screen.findByRole("main"));
    await waitFor(() => {
      expect(main.getByRole("link", { name: /Passwords/ })).toHaveTextContent("2 items");
    });
    expect(main.getByRole("link", { name: /Notes/ })).toHaveTextContent("1 note");
    expect(screen.getByRole("link", { name: "Search passwords, notes" })).toHaveAttribute(
      "href",
      ROUTES.search,
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", ROUTES.settings);
    expect(screen.queryByText(/Media/)).toBeNull();
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

  it("shows how much space the vault takes on this phone", async () => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: { estimate: () => Promise.resolve({ usage: 312_000_000, quota: 10_000_000_000 }) },
    });
    renderUnlocked(ROUTES.home);
    expect(await screen.findByText("ON THIS PHONE")).toBeInTheDocument();
    expect(await screen.findByText("312 MB")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Space used on this phone" }),
    ).toBeInTheDocument();
  });

  it("lists recently opened items, newest first, and opens one on its own screen", async () => {
    const bank = await addEntry(login("Bank"));
    const note = await addEntry({ kind: EntryKind.Note, title: "Wifi", body: "x" });
    await recordUse(bank.id, EntryKind.Password, Date.now() - 12 * 60_000);
    await recordUse(note.id, EntryKind.Note, Date.now() - 60_000);
    renderUnlocked(ROUTES.home);

    const section = await screen.findByRole("region", { name: "Recently opened" });
    await waitFor(() => {
      expect(within(section).getAllByRole("button").length).toBeGreaterThan(1);
    });
    const rows = within(section).getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Wifi");
    expect(rows[0]).toHaveTextContent("Note · opened 1 min ago");
    expect(rows[1]).toHaveTextContent("Bank");
    expect(rows[1]).toHaveTextContent("Password · opened 12 min ago");

    const target = rows[1];
    if (!target) throw new Error("expected two recent rows");
    await userEvent.setup().click(within(target).getByRole("button"));
    expect(await screen.findByRole("heading", { name: "Bank" })).toBeInTheDocument();
    expect(screen.getByText("PASSWORD")).toBeInTheDocument();
  });

  it("forgets the recent items on Clear", async () => {
    const bank = await addEntry(login("Bank"));
    await recordUse(bank.id, EntryKind.Password);
    renderUnlocked(ROUTES.home);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Clear" }));
    await waitFor(() => {
      expect(screen.queryByRole("region", { name: "Recently opened" })).toBeNull();
    });
  });

  it("has no recent section when nothing was opened", async () => {
    await addEntry(login("Bank"));
    renderUnlocked(ROUTES.home);
    await screen.findByRole("heading", { name: "Hello, Jane" });
    expect(screen.queryByRole("region", { name: "Recently opened" })).toBeNull();
  });
});
