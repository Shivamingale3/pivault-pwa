import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EntryKind } from "@/enums/vault.enum";
import { ROUTES } from "@/routes/route-paths";
import { clearUnlockedKey } from "@/services/secure-memory.service";
import { clearSearchHistory } from "@/services/search-history.service";
import { addEntry } from "@/services/vault.service";
import { fakeSecret } from "@/test/fake-secret";
import { freshIndexedDbPerTest } from "@/test/indexed-db";
import { renderUnlocked, unlockVaultForTest } from "@/test/vault-screens";

freshIndexedDbPerTest();

const note = (title: string, body = "text") => ({ kind: EntryKind.Note, title, body }) as const;
const login = (title: string, username = "jane") =>
  ({
    kind: EntryKind.Password,
    title,
    username,
    password: fakeSecret(),
    url: "",
    notes: "",
  }) as const;

beforeEach(unlockVaultForTest);
afterEach(() => {
  clearUnlockedKey();
  clearSearchHistory();
});

describe("notes", () => {
  it("shows the empty state with a way to write one", async () => {
    renderUnlocked(ROUTES.notes);
    expect(await screen.findByRole("heading", { name: "No notes yet" })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Write a note" }));
    expect(await screen.findByRole("textbox", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "Formatting" })).toBeInTheDocument();
  });

  it("lists notes with a count, filters by title and opens one", async () => {
    await addEntry(note("Wifi codes"));
    await addEntry(note("Licence"));
    renderUnlocked(ROUTES.notes);
    const user = userEvent.setup();
    expect(await screen.findByText("2 notes · encrypted on this phone")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Filter notes" }), "wifi");
    const list = await screen.findByRole("list", { name: "Notes" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    await user.click(within(list).getByRole("button", { name: /Wifi codes/ }));
    expect(await screen.findByRole("heading", { name: "Wifi codes" })).toBeInTheDocument();
    expect(screen.getByText(/Body stays encrypted/)).toBeInTheDocument();
  });
});

describe("search", () => {
  it("finds passwords by title or username and notes by title, never by body or secret", async () => {
    const secret = fakeSecret();
    await addEntry({ ...login("Bank"), password: secret });
    await addEntry(note("Bank pin hints", "hidden-body"));
    renderUnlocked(ROUTES.search);
    const user = userEvent.setup();
    const field = await screen.findByRole("searchbox", { name: "Search" });
    await user.type(field, "bank");
    expect(await screen.findByRole("region", { name: "Passwords" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Notes" })).toBeInTheDocument();

    await user.clear(field);
    await user.type(field, "hidden-body");
    expect(await screen.findByText("Nothing found")).toBeInTheDocument();
    await user.clear(field);
    await user.type(field, secret);
    expect(await screen.findByText("Nothing found")).toBeInTheDocument();
  });

  it("remembers recent searches in memory after opening a result", async () => {
    await addEntry(login("Bank"));
    renderUnlocked(ROUTES.search);
    const user = userEvent.setup();
    await user.type(await screen.findByRole("searchbox", { name: "Search" }), "bank");
    await user.click(
      within(await screen.findByRole("region", { name: "Passwords" })).getByRole("button"),
    );
    expect(await screen.findByRole("heading", { name: "Bank" })).toBeInTheDocument();
    const { recentSearches } = await import("@/services/search-history.service");
    expect(recentSearches()).toEqual(["bank"]);
  });
});
