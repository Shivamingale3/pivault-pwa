import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EntryKind } from "@/enums/vault.enum";
import { ROUTES, homeList } from "@/routes/route-paths";
import { clearUnlockedKey } from "@/services/secure-memory.service";
import { recordUse } from "@/services/usage.service";
import { addEntry } from "@/services/vault.service";
import { fakeSecret } from "@/test/fake-secret";
import { freshIndexedDbPerTest } from "@/test/indexed-db";
import { renderUnlocked, unlockVaultForTest } from "@/test/vault-screens";

freshIndexedDbPerTest();

const login = (title: string, overrides: Record<string, string> = {}) =>
  ({
    kind: EntryKind.Password,
    title,
    username: `${title.toLowerCase()}@example.com`,
    password: fakeSecret(),
    url: "",
    notes: "",
    ...overrides,
  }) as const;

/** Home with the Passwords tile picked. */
const openPasswords = () => {
  renderUnlocked({ pathname: ROUTES.home, search: "?show=password" });
};
const list = () => screen.findByRole("list", { name: "Passwords" });
const rowOf = async (title: string) => {
  const button = await within(await list()).findByRole("button", { name: title });
  const row = button.closest("li");
  if (!row) throw new Error(`no row for ${title}`);
  return row;
};

beforeEach(unlockVaultForTest);
afterEach(() => {
  clearUnlockedKey();
  vi.restoreAllMocks();
});

describe("home: passwords list", () => {
  it("builds the address for each list, Notes being plain Home", () => {
    expect(homeList(EntryKind.Note)).toBe(ROUTES.home);
    expect(homeList(EntryKind.Password)).toBe("/?show=password");
  });

  it("invites the user to add the first one, or restore from the Pi", async () => {
    const info = vi.spyOn(toast, "info");
    openPasswords();
    expect(await screen.findByRole("heading", { name: "No passwords yet" })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Sync now" }));
    expect(info).toHaveBeenCalledWith("Checking your Pi for a backup…");
  });

  it("opens the password form straight from the empty state", async () => {
    openPasswords();
    await userEvent.setup().click(await screen.findByRole("button", { name: "Add a password" }));
    expect(await screen.findByLabelText("PASSWORD")).toBeInTheDocument();
  });

  it("shows each row with title, username and bullets", async () => {
    await addEntry(login("Bank"));
    openPasswords();
    const row = await rowOf("Bank");
    expect(row).toHaveTextContent("bank@example.com");
    expect(row).toHaveTextContent("•••••••••••");
  });

  it("reveals one password at a time with the eye, and says whether it is pressed", async () => {
    const secret = fakeSecret();
    await addEntry(login("Bank", { password: secret }));
    await addEntry(login("Mail"));
    openPasswords();
    const user = userEvent.setup();
    const bank = await rowOf("Bank");
    const eye = within(bank).getByRole("button", { name: "Show password: Bank" });
    expect(eye).toHaveAttribute("aria-pressed", "false");
    await user.click(eye);
    expect(bank).toHaveTextContent(secret);
    expect(await rowOf("Mail")).toHaveTextContent("•••••••••••");
    await user.click(within(bank).getByRole("button", { name: "Hide password: Bank" }));
    expect(bank).not.toHaveTextContent(secret);
  });

  it("copies a password with a toast", async () => {
    const secret = fakeSecret();
    const success = vi.spyOn(toast, "success");
    await addEntry(login("Bank", { password: secret }));
    openPasswords();
    await userEvent
      .setup()
      .click(within(await rowOf("Bank")).getByRole("button", { name: "Copy password: Bank" }));
    expect(await navigator.clipboard.readText()).toBe(secret);
    expect(success).toHaveBeenCalledWith(expect.stringContaining("Password copied"));
  });

  it("orders by most recent use, then by when it was changed", async () => {
    const old = await addEntry(login("Alpha"));
    await addEntry(login("Beta"));
    await recordUse(old.id, EntryKind.Password, Date.now() + 60_000);
    openPasswords();
    await waitFor(async () => {
      expect(within(await list()).getAllByRole("listitem")[0]).toHaveTextContent("Alpha");
    });
  });

  it("opens a row on its own screen", async () => {
    await addEntry(login("Bank"));
    openPasswords();
    await userEvent
      .setup()
      .click(within(await rowOf("Bank")).getByRole("button", { name: "Bank" }));
    expect(await screen.findByRole("heading", { name: "Bank" })).toBeInTheDocument();
  });

  it("has no separate Passwords screen: an old /passwords link lands on Home", async () => {
    renderUnlocked("/passwords");
    expect(await screen.findByRole("heading", { name: "Home" })).toBeInTheDocument();
  });
});
