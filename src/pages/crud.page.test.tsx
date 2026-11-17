import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getVaultDb } from "@/db/vault.db";
import { EntryKind } from "@/enums/vault.enum";
import { ROUTES, entryPath } from "@/routes/route-paths";
import { clearUnlockedKey } from "@/services/secure-memory.service";
import { loadUsage } from "@/services/usage.service";
import { addEntry } from "@/services/vault.service";
import { fakeSecret } from "@/test/fake-secret";
import { freshIndexedDbPerTest } from "@/test/indexed-db";
import { renderUnlocked, unlockVaultForTest } from "@/test/vault-screens";

freshIndexedDbPerTest();

const stored = async () =>
  JSON.stringify(
    (await (await getVaultDb()).entries.find().exec()).map((doc) => doc.toMutableJSON()),
  );
const count = async () => (await (await getVaultDb()).entries.find().exec()).length;
const chip = (text: string | RegExp) =>
  waitFor(
    () => {
      expect(screen.getAllByRole("status").some((el) => el.textContent.match(text))).toBe(true);
    },
    { timeout: 3000 },
  );

beforeEach(unlockVaultForTest);
afterEach(clearUnlockedKey);

describe("password detail", () => {
  const seed = (secret: string) =>
    addEntry({
      kind: EntryKind.Password,
      title: "GitHub",
      username: "jane@example.com",
      password: secret,
      url: "https://github.com",
      notes: "",
      fields: [{ label: "Recovery email", value: "backup@example.com" }],
    });

  it("shows identity, field cards, dates and the saved chip, and counts as opened", async () => {
    const secret = fakeSecret();
    const entry = await seed(secret);
    renderUnlocked(entryPath.password(entry.id));
    expect(await screen.findByRole("heading", { name: "GitHub" })).toBeInTheDocument();
    expect(screen.getByText("github.com")).toBeInTheDocument();
    expect(screen.getByText("RECOVERY EMAIL")).toBeInTheDocument();
    expect(screen.getByText("backup@example.com")).toBeInTheDocument();
    expect(screen.getByText("CREATED")).toBeInTheDocument();
    expect(screen.getByText("Saved on this phone · backed up at next sync")).toBeInTheDocument();
    expect(screen.queryByText(secret)).toBeNull();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByText(secret)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy password" }));
    expect(await navigator.clipboard.readText()).toBe(secret);
    await waitFor(async () => {
      expect((await loadUsage())[entry.id]).toBeDefined();
    });
  });

  it("deletes from the overflow sheet only after confirming, then returns to the list", async () => {
    const entry = await seed(fakeSecret());
    renderUnlocked(entryPath.password(entry.id));
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "More" }));
    await user.click(await screen.findByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("alertdialog").catch(() => screen.findByRole("dialog"));
    expect(dialog).toHaveTextContent("Delete this password?");
    expect(dialog).toHaveTextContent("there is no trash to restore from");
    expect(await count()).toBe(1);
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("heading", { name: "No passwords yet" })).toBeInTheDocument();
  });

  it("goes back to the list when the item does not exist", async () => {
    renderUnlocked(entryPath.password("01HZZZZZZZZZZZZZZZZZZZZZZZ"));
    expect(await screen.findByRole("heading", { name: "Passwords" })).toBeInTheDocument();
  });
});

describe("password form", () => {
  it("saves by itself once it has a name and password, encrypted, with no Save button", async () => {
    renderUnlocked(ROUTES.passwordNew);
    const user = userEvent.setup();
    expect(screen.queryByRole("button", { name: /^Save/ })).toBeNull();
    await user.type(await screen.findByLabelText("NAME"), "Bank");
    expect(await count()).toBe(0);
    await user.type(screen.getByLabelText("PASSWORD"), "Correct-Horse-9!");
    await chip("Saved just now");
    expect(await count()).toBe(1);
    expect(await stored()).not.toMatch(/Bank|Correct/);
    expect(screen.getByRole("img", { name: /Strength:/ })).toBeInTheDocument();

    await user.type(screen.getByLabelText("USERNAME"), "jane");
    await chip("Saved just now");
    expect(await count()).toBe(1);
    await user.click(screen.getByRole("link", { name: "Back" }));
    expect(await screen.findByText("jane")).toBeInTheDocument();
  });

  it("says so when there is nothing saveable, and settles again when a change is undone", async () => {
    const entry = await addEntry({
      kind: EntryKind.Password,
      title: "Mail",
      username: "",
      password: fakeSecret(),
      url: "",
      notes: "",
    });
    renderUnlocked(entryPath.passwordEdit(entry.id));
    const user = userEvent.setup();
    const name = await screen.findByLabelText("NAME");
    await chip("Saved just now");
    await user.type(name, "x");
    await user.type(name, "{Backspace}");
    await chip("Saved just now");
    await user.clear(name);
    await chip("Not saved yet");
  });

  it("keeps a custom value typed without a label", async () => {
    const entry = await addEntry({
      kind: EntryKind.Password,
      title: "Mail",
      username: "",
      password: fakeSecret(),
      url: "",
      notes: "",
    });
    renderUnlocked(entryPath.passwordEdit(entry.id));
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "+ Add field" }));
    await user.type(screen.getByLabelText("Field 1 value"), "blue");
    await chip("Saved just now");
    await user.click(screen.getByRole("link", { name: "Back" }));
    expect(await screen.findByText("OTHER")).toBeInTheDocument();
    expect(screen.getByText("blue")).toBeInTheDocument();
  });

  it("rolls a password with the dice, and takes one from the generator sheet", async () => {
    renderUnlocked(ROUTES.passwordNew);
    const user = userEvent.setup();
    const field = await screen.findByLabelText<HTMLInputElement>("PASSWORD");
    await user.click(screen.getByRole("button", { name: "Generate a new password" }));
    expect(field.value).toHaveLength(16);

    await user.click(screen.getByRole("button", { name: "Generator settings" }));
    const sheet = await screen.findByRole("dialog");
    const before = within(sheet).getByRole("status", { name: "Generated password" }).textContent;
    await user.click(within(sheet).getByRole("switch", { name: /Symbols/ }));
    const made = within(sheet).getByRole("status", { name: "Generated password" }).textContent;
    expect(made).not.toBe(before);
    expect(made).toMatch(/^[A-Za-z0-9]{16}$/);
    await user.click(within(sheet).getByRole("button", { name: "Reroll" }));
    const rerolled = within(sheet).getByRole("status", { name: "Generated password" }).textContent;
    await user.click(within(sheet).getByRole("button", { name: "Use this password" }));
    await waitFor(() => {
      expect(field.value).toBe(rerolled);
    });
  });

  it("adds, saves and removes custom fields, and deletes from the form", async () => {
    const entry = await addEntry({
      kind: EntryKind.Password,
      title: "Mail",
      username: "",
      password: fakeSecret(),
      url: "",
      notes: "",
    });
    renderUnlocked(entryPath.passwordEdit(entry.id));
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "+ Add field" }));
    await user.type(screen.getByLabelText("Field 1 label"), "Hint");
    await user.type(screen.getByLabelText("Field 1 value"), "blue");
    await chip("Saved just now");
    await user.click(screen.getByRole("link", { name: "Back" }));
    expect(await screen.findByText("HINT")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Edit" }));
    await user.click(await screen.findByRole("button", { name: "Remove field 1" }));
    await chip("Saved just now");
    await user.click(screen.getByRole("button", { name: "Delete this password" }));
    await user.click(await screen.findByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("heading", { name: "No passwords yet" })).toBeInTheDocument();
    expect(await count()).toBe(0);
  });
});

describe("notes", () => {
  const BODY = [
    "Keep **these** safe.",
    "",
    "## Codes",
    "```",
    "ABCD-1234",
    "```",
    "- [ ] print",
    "- [x] store",
  ].join("\n");

  it("renders the note, and ticking a checkbox saves it", async () => {
    const note = await addEntry({ kind: EntryKind.Note, title: "Recovery", body: BODY });
    renderUnlocked(entryPath.note(note.id));
    expect(await screen.findByRole("heading", { name: "Recovery" })).toBeInTheDocument();
    expect(screen.getByText(/· 7 words/)).toBeInTheDocument();
    expect(screen.getByText("these").tagName).toBe("STRONG");
    expect(screen.getByRole("heading", { name: "Codes" })).toBeInTheDocument();
    expect(screen.getByText("ABCD-1234").closest("pre")).not.toBeNull();
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes.map((box) => box.getAttribute("aria-checked"))).toEqual(["false", "true"]);
    const [first] = screen.getAllByRole("checkbox");
    if (!first) throw new Error("expected a checkbox");
    await userEvent.setup().click(first);
    await waitFor(() => {
      expect(screen.getAllByRole("checkbox")[0]).toHaveAttribute("aria-checked", "true");
    });
  });

  it("keeps both ticks when two boxes are ticked at once", async () => {
    const note = await addEntry({
      kind: EntryKind.Note,
      title: "List",
      body: "- [ ] one\n- [ ] two",
    });
    renderUnlocked(entryPath.note(note.id));
    const [first, second] = await screen.findAllByRole("checkbox");
    if (!first || !second) throw new Error("expected two checkboxes");
    // No waiting in between: the second tick must build on the first.
    first.click();
    second.click();
    await waitFor(() => {
      expect(
        screen.getAllByRole("checkbox").map((box) => box.getAttribute("aria-checked")),
      ).toEqual(["true", "true"]);
    });
  });

  it("puts the title, then the formatting row, then the body, which scrolls inside itself", async () => {
    renderUnlocked(ROUTES.noteNew);
    const title = await screen.findByRole("textbox", { name: "Title" });
    const toolbar = screen.getByRole("toolbar", { name: "Formatting" });
    const body = screen.getByRole("textbox", { name: "Write your note" });
    const follows = (a: Element, b: Element) =>
      (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    expect(follows(title, toolbar)).toBe(true);
    expect(follows(toolbar, body)).toBe(true);
    expect(body).toHaveClass("flex-1", "overflow-y-auto");
  });

  it("writes a note that saves itself, with formatting and undo", async () => {
    renderUnlocked(ROUTES.noteNew);
    const user = userEvent.setup();
    await user.type(await screen.findByRole("textbox", { name: "Title" }), "Wifi");
    const body = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Write your note" });
    await user.type(body, "router");
    await chip("Saved · encrypted");
    expect(await count()).toBe(1);
    expect(await stored()).not.toMatch(/Wifi|router/);

    body.setSelectionRange(0, 6);
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(body.value).toBe("**router**");
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(body.value).toBe("router");
    await user.click(screen.getByRole("button", { name: "Checkbox" }));
    expect(body.value).toBe("- [ ] router");
    await chip("Saved · encrypted");
    await user.click(screen.getByRole("link", { name: "Back" }));
    expect(await screen.findByRole("list", { name: "Notes" })).toHaveTextContent("Wifi");
  });
});
