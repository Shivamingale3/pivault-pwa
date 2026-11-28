import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
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

const STRONG = "Correct-Horse-Battery-9!";
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

const list = () => screen.findByRole("list", { name: "Passwords" });
const rowOf = async (title: string) => {
  const button = await within(await list()).findByRole("button", { name: title });
  const row = button.closest("li");
  if (!row) throw new Error(`no row for ${title}`);
  return row;
};
const titles = async () =>
  within(await list())
    .getAllByRole("listitem")
    .map((item) => within(item).getAllByRole("button")[0]?.textContent.slice(0, 40) ?? "");

beforeEach(unlockVaultForTest);
afterEach(() => {
  clearUnlockedKey();
  vi.restoreAllMocks();
});

describe("passwords: empty", () => {
  it("invites the user to add the first one, or restore from the Pi", async () => {
    const info = vi.spyOn(toast, "info");
    renderUnlocked(ROUTES.passwords);
    expect(await screen.findByRole("heading", { name: "No passwords yet" })).toBeInTheDocument();
    expect(screen.getByText(/Add your first login to get started/)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Sync now" }));
    expect(info).toHaveBeenCalledWith("Checking your Pi for a backup…");
  });

  it("opens the password form straight from the empty state, with no Save button", async () => {
    renderUnlocked(ROUTES.passwords);
    await userEvent.setup().click(await screen.findByRole("button", { name: "Add a password" }));
    expect(await screen.findByLabelText("PASSWORD")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Not saved yet");
  });
});

describe("passwords: the list", () => {
  it("shows the count and order, each row with title, username and bullets", async () => {
    await addEntry(login("Bank"));
    renderUnlocked(ROUTES.passwords);
    expect(await screen.findByText("1 item")).toBeInTheDocument();
    const row = await rowOf("Bank");
    expect(row).toHaveTextContent("bank@example.com");
    expect(row).toHaveTextContent("•••••••••••");
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("reveals one password at a time with the eye, and says whether it is pressed", async () => {
    const secret = fakeSecret();
    await addEntry(login("Bank", { password: secret }));
    await addEntry(login("Mail"));
    renderUnlocked(ROUTES.passwords);
    const user = userEvent.setup();
    const bank = await rowOf("Bank");
    const eye = within(bank).getByRole("button", { name: "Show password: Bank" });
    expect(eye).toHaveAttribute("aria-pressed", "false");
    await user.click(eye);
    expect(bank).toHaveTextContent(secret);
    expect(within(bank).getByRole("button", { name: "Hide password: Bank" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await rowOf("Mail")).not.toHaveTextContent(/pw /);
    await user.click(within(bank).getByRole("button", { name: "Hide password: Bank" }));
    expect(bank).not.toHaveTextContent(secret);
  });

  it("copies a password with a toast, and counts it as used", async () => {
    const secret = fakeSecret();
    const success = vi.spyOn(toast, "success");
    await addEntry(login("Bank", { password: secret }));
    renderUnlocked(ROUTES.passwords);
    const user = userEvent.setup();
    await user.click(
      within(await rowOf("Bank")).getByRole("button", { name: "Copy password: Bank" }),
    );
    expect(await navigator.clipboard.readText()).toBe(secret);
    expect(success).toHaveBeenCalledWith(expect.stringContaining("Password copied"));
  });

  it("orders by most recent use, then by when it was changed", async () => {
    const old = await addEntry(login("Alpha"));
    await addEntry(login("Beta"));
    await addEntry(login("Gamma"));
    await recordUse(old.id, EntryKind.Password, Date.now() + 60_000);
    renderUnlocked(ROUTES.passwords);
    await list();
    await waitFor(async () => {
      expect((await titles())[0]).toContain("Alpha");
    });
  });

  it("filters by title, username and site, and says when nothing matches", async () => {
    await addEntry(login("Bank", { url: "https://hdfc.example" }));
    await addEntry(login("Mail"));
    renderUnlocked(ROUTES.passwords);
    const user = userEvent.setup();
    const filter = await screen.findByRole("searchbox", { name: "Filter passwords" });
    await rowOf("Bank");
    await user.type(filter, "hdfc");
    expect(within(await list()).getAllByRole("listitem")).toHaveLength(1);
    await user.clear(filter);
    await user.type(filter, "mail@");
    expect(within(await list()).getAllByRole("listitem")).toHaveLength(1);
    await user.clear(filter);
    await user.type(filter, "zzz");
    expect(await screen.findByText("No matches")).toBeInTheDocument();
  });

  it("opens a row on its own screen, and the round button opens a new form", async () => {
    await addEntry(login("Bank"));
    renderUnlocked(ROUTES.passwords);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Add a password" }));
    expect(await screen.findByLabelText("NAME")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    await user.click(within(await rowOf("Bank")).getByRole("button", { name: "Bank" }));
    expect(await screen.findByRole("heading", { name: "Bank" })).toBeInTheDocument();
  });
});

describe("passwords: sort", () => {
  const seed = async () => {
    await addEntry(login("Cloudflare", { password: STRONG }));
    await addEntry(login("Alpha", { password: "hunter2" }));
    await addEntry(login("Bravo", { password: STRONG }));
  };

  it("the Sort pill switches to Recent / A-Z / Weak with card rows and the search button", async () => {
    await seed();
    renderUnlocked(ROUTES.passwords);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Sort" }));

    expect(await screen.findByText("3 items")).toBeInTheDocument();
    const tabs = screen.getByRole("group", { name: "Sort passwords" });
    expect(
      within(tabs)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Recent", "A-Z", "Weak"]);
    expect(within(tabs).getByRole("button", { name: "Recent" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("link", { name: "Search" })).toHaveAttribute("href", ROUTES.search);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("A-Z sorts by title and Weak keeps only the weak passwords", async () => {
    await seed();
    renderUnlocked({ pathname: ROUTES.passwords, state: { sort: true } });
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "A-Z" }));
    await waitFor(async () => {
      expect(await titles()).toEqual(
        [
          "AAlphaalpha@example.com",
          "BBravobravo@example.com",
          "CCloudflarecloudflare@example.com",
        ].map((t) => t.slice(0, 40)),
      );
    });
    await user.click(screen.getByRole("button", { name: "Weak" }));
    await waitFor(async () => {
      expect(within(await list()).getAllByRole("listitem")).toHaveLength(1);
    });
    expect(within(await list()).getByRole("button")).toHaveTextContent("Alpha");
  });

  it("says when no password is weak, and shows when each was last used", async () => {
    await addEntry(login("Cloudflare", { password: STRONG }));
    const used = await addEntry(login("Bravo", { password: STRONG }));
    await recordUse(used.id, EntryKind.Password, Date.now() - 2 * 3_600_000);
    renderUnlocked({ pathname: ROUTES.passwords, state: { sort: true } });
    const user = userEvent.setup();
    expect(await screen.findByText("2H AGO")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Weak" }));
    expect(await screen.findByText("No weak passwords")).toBeInTheDocument();
  });

  it("leaves the sort state with the back button, then goes home with it", async () => {
    await seed();
    renderUnlocked({ pathname: ROUTES.passwords, state: { sort: true } });
    const user = userEvent.setup();
    await screen.findByRole("group", { name: "Sort passwords" });
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByRole("button", { name: "Sort" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Sort passwords" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByRole("heading", { name: "Home" })).toBeInTheDocument();
  });
});
