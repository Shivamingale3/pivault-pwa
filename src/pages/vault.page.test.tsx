import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getVaultDb } from "@/db/vault.db";
import { AuthStatus } from "@/enums/auth.enum";
import { EntryKind } from "@/enums/vault.enum";
import { AuthProvider } from "@/providers/auth.provider";
import { AppRoutes } from "@/routes/app.routes";
import { ROUTES } from "@/routes/route-paths";
import { generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { clearUnlockedKey, setUnlockedKey } from "@/services/secure-memory.service";
import { addEntry } from "@/services/vault.service";
import { fakeSecret } from "@/test/fake-secret";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

freshIndexedDbPerTest();

const SECRET = fakeSecret();

const render_ = () =>
  render(
    <MemoryRouter initialEntries={[ROUTES.home]}>
      <AuthProvider initialStatus={AuthStatus.Unlocked}>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  );

const NOTE = { kind: EntryKind.Note, title: "Wifi codes", body: "router: hunter2" } as const;
const LOGIN = {
  kind: EntryKind.Password,
  title: "Bank",
  username: "jane",
  password: SECRET,
  url: "https://bank.example",
  notes: "pin in the drawer",
} as const;

const list = () => screen.findByRole("list", { name: "Vault items" });
const sheet = () => screen.findByRole("dialog");
/** The add button is disabled until the vault has finished opening. */
const addButton = async () => {
  const button = await screen.findByRole("button", { name: "Add item" });
  await waitFor(() => {
    expect(button).toBeEnabled();
  });
  return button;
};

beforeEach(async () => {
  setUnlockedKey(await importRecoveryKey(generateRecoveryKey()));
});
afterEach(() => {
  clearUnlockedKey();
  vi.restoreAllMocks();
});

describe("empty vault", () => {
  it("invites the user to add something", async () => {
    render_();
    expect(await screen.findByText("Nothing here yet")).toBeInTheDocument();
    expect(await addButton()).toBeEnabled();
  });
});

describe("adding", () => {
  it("saves a note encrypted: it appears in the list and the database holds no readable text", async () => {
    render_();
    const user = userEvent.setup();
    await user.click(await addButton());
    const dialog = await sheet();
    const save = within(dialog).getByRole("button", { name: "Save" });
    expect(save).toBeDisabled();

    await user.type(within(dialog).getByLabelText("Title"), "Wifi codes");
    await user.type(within(dialog).getByLabelText("Note"), "router: hunter2");
    expect(save).toBeEnabled();
    await user.click(save);

    const row = within(await list()).getByRole("button", { name: /Wifi codes/ });
    expect(row).toHaveTextContent("router: hunter2");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    const stored = JSON.stringify(
      (await (await getVaultDb()).entries.find().exec()).map((d) => d.toMutableJSON()),
    );
    expect(stored).not.toMatch(/Wifi|hunter2|note/);
  });

  it("saves a password, which needs a title and the password itself", async () => {
    render_();
    const user = userEvent.setup();
    await user.click(await addButton());
    const dialog = await sheet();
    await user.click(within(dialog).getByRole("button", { name: "Password" }));
    const save = within(dialog).getByRole("button", { name: "Save" });

    await user.type(within(dialog).getByLabelText("Title"), "Bank");
    expect(save).toBeDisabled();
    await user.type(within(dialog).getByLabelText("Username"), "jane");
    await user.type(within(dialog).getByLabelText("Password"), SECRET);
    await user.type(within(dialog).getByLabelText("Website"), "https://bank.example");
    expect(save).toBeEnabled();
    await user.click(save);

    const row = within(await list()).getByRole("button", { name: /Bank/ });
    expect(row).toHaveTextContent("jane");
    expect(row).not.toHaveTextContent(SECRET);
  });

  it("closes without saving on cancel", async () => {
    render_();
    const user = userEvent.setup();
    await user.click(await addButton());
    const dialog = await sheet();
    await user.type(within(dialog).getByLabelText("Title"), "Draft");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("keeps the sheet open and explains when saving fails", async () => {
    const error = vi.spyOn(toast, "error");
    const service = await import("@/services/vault.service");
    vi.spyOn(service, "addEntry").mockRejectedValue(new TypeError("disk full"));
    render_();
    const user = userEvent.setup();
    await user.click(await addButton());
    const dialog = await sheet();
    await user.type(within(dialog).getByLabelText("Title"), "Wifi");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(error).toHaveBeenCalled();
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Save" })).toBeEnabled();
  });
});

describe("viewing", () => {
  it("hides the password until asked, and copies it", async () => {
    await addEntry(LOGIN);
    render_();
    const user = userEvent.setup();
    await user.click(within(await list()).getByRole("button", { name: /Bank/ }));
    const dialog = await sheet();

    expect(within(dialog).queryByText(SECRET)).toBeNull();
    await user.click(within(dialog).getByRole("button", { name: "Show password" }));
    expect(within(dialog).getByText(SECRET)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Hide password" }));
    expect(within(dialog).queryByText(SECRET)).toBeNull();

    await user.click(within(dialog).getByRole("button", { name: "Copy password" }));
    expect(await navigator.clipboard.readText()).toBe(SECRET);
  });

  it("links the website only for http(s) addresses", async () => {
    await addEntry(LOGIN);
    await addEntry({ ...LOGIN, title: "Evil", url: "javascript:alert(1)" });
    render_();
    const user = userEvent.setup();
    await user.click(within(await list()).getByRole("button", { name: /Bank/ }));
    expect(
      within(await sheet()).getByRole("link", { name: "https://bank.example" }),
    ).toHaveAttribute("rel", "noopener noreferrer");
    await user.click(within(await sheet()).getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await user.click(within(await list()).getByRole("button", { name: /Evil/ }));
    expect(within(await sheet()).queryByRole("link")).toBeNull();
  });
});

describe("editing and deleting", () => {
  it("edits an item and shows the new version", async () => {
    await addEntry(NOTE);
    render_();
    const user = userEvent.setup();
    await user.click(within(await list()).getByRole("button", { name: /Wifi codes/ }));
    await user.click(within(await sheet()).getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("heading", { name: "Edit note" });
    expect(dialog).toBeInTheDocument();
    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Guest wifi");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await within(await list()).findByRole("button", { name: /Guest wifi/ }),
    ).toBeInTheDocument();
    expect(within(await list()).queryByRole("button", { name: /Wifi codes/ })).toBeNull();
  });

  it("deletes only after confirming, and says it is permanent", async () => {
    await addEntry(NOTE);
    render_();
    const user = userEvent.setup();
    await user.click(within(await list()).getByRole("button", { name: /Wifi codes/ }));
    await user.click(within(await sheet()).getByRole("button", { name: "Delete" }));
    expect(await screen.findByText(/no trash and no undo/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Keep it" }));
    await waitFor(() => {
      expect(screen.queryByText(/no trash and no undo/)).toBeNull();
    });
    expect(within(await list()).getByRole("button", { name: /Wifi codes/ })).toBeInTheDocument();

    await user.click(within(await list()).getByRole("button", { name: /Wifi codes/ }));
    await user.click(within(await sheet()).getByRole("button", { name: "Delete" }));
    await user.click(await screen.findByRole("button", { name: "Delete note" }));
    expect(await screen.findByText("Nothing here yet")).toBeInTheDocument();
  });
});

describe("finding things", () => {
  it("filters by type and searches titles, usernames and sites, never passwords", async () => {
    await addEntry(NOTE);
    await addEntry(LOGIN);
    render_();
    const user = userEvent.setup();
    const rows = async () => within(await list()).getAllByRole("button");
    expect(await rows()).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Notes" }));
    expect(await rows()).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Passwords" }));
    expect(await rows()).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "All" }));

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "jane");
    expect(await rows()).toHaveLength(1);
    await user.clear(screen.getByRole("searchbox", { name: "Search" }));
    await user.type(screen.getByRole("searchbox", { name: "Search" }), SECRET);
    expect(await screen.findByText("No matches")).toBeInTheDocument();
  });
});

describe("locking and signing out", () => {
  it("removes every decrypted item from the screen when locked", async () => {
    await addEntry(LOGIN);
    render_();
    const user = userEvent.setup();
    await within(await list()).findByRole("button", { name: /Bank/ });
    await user.click(screen.getByRole("button", { name: "Lock" }));

    expect(await screen.findByRole("heading", { name: "PiVault is locked" })).toBeInTheDocument();
    expect(screen.queryByText(/Bank/)).toBeNull();
  });

  it("hides, and says so, when an item can't be decrypted", async () => {
    const error = vi.spyOn(toast, "error");
    await addEntry(NOTE);
    setUnlockedKey(await importRecoveryKey(generateRecoveryKey()));
    render_();
    await waitFor(() => {
      expect(error).toHaveBeenCalledWith("1 item couldn't be decrypted and is hidden.");
    });
    expect(await screen.findByText("Nothing here yet")).toBeInTheDocument();
  });
});
