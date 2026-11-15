import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { BehaviorSubject } from "rxjs";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthStatus } from "@/enums/auth.enum";
import { EntryKind } from "@/enums/vault.enum";
import type { SyncState } from "@/interfaces/sync.interface";
import { AuthProvider } from "@/providers/auth.provider";
import { AppRoutes } from "@/routes/app.routes";
import { ROUTES } from "@/routes/route-paths";
import type { SessionRecord } from "@/schemas/session.schema";
import { generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { clearUnlockedKey, setUnlockedKey } from "@/services/secure-memory.service";
import { saveSession } from "@/services/session.service";
import { type VaultSync, startVaultSync } from "@/services/vault-sync.service";
import { addEntry } from "@/services/vault.service";
import { fakeSecret } from "@/test/fake-secret";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

freshIndexedDbPerTest();

const SESSION: SessionRecord = {
  userId: "01JABC",
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  token: "t".repeat(43),
  expiresAt: "2099-12-15T10:00:00.000Z",
  recoveryKeyConfigured: true,
  setupDone: true,
};

const FOUR_MINUTES = 4 * 60_000;
const stateWith = (overrides: Partial<SyncState> = {}): SyncState => ({
  status: "synced",
  error: null,
  stats: {
    sent: { created: 4, updated: 2, deleted: 1 },
    received: { created: 3, updated: 0, deleted: 5 },
    lastSyncedAt: Date.now() - FOUR_MINUTES,
  },
  ...overrides,
});

let state$: BehaviorSubject<SyncState>;
let syncNow: ReturnType<typeof vi.fn<() => Promise<void>>>;
let stop: ReturnType<typeof vi.fn<() => Promise<void>>>;

const open = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider initialStatus={AuthStatus.Unlocked}>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  );

beforeEach(async () => {
  state$ = new BehaviorSubject(stateWith());
  syncNow = vi.fn(() => Promise.resolve());
  stop = vi.fn(() => Promise.resolve());
  vi.mocked(startVaultSync).mockImplementation(() =>
    Promise.resolve({ state$: state$.asObservable(), syncNow, stop } satisfies VaultSync),
  );
  await saveSession(SESSION);
  setUnlockedKey(await importRecoveryKey(generateRecoveryKey()));
});
afterEach(() => {
  clearUnlockedKey();
  vi.restoreAllMocks();
});

/** The card that goes with an eyebrow heading. */
const sectionOf = async (name: string): Promise<HTMLElement> => {
  const { parentElement } = await screen.findByRole("heading", { name });
  if (!parentElement) throw new Error(`no section for ${name}`);
  return parentElement;
};

describe("Settings home", () => {
  it("shows who is signed in, the Sync row under SERVER, and a way back", async () => {
    open(ROUTES.settings);
    expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("J")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "SERVER" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", ROUTES.home);
    expect(screen.getByText(/users are added by your admin/)).toHaveTextContent(/^PiVault · /);
  });

  it("summarises the sync status in the Sync row and opens Settings › Sync", async () => {
    open(ROUTES.settings);
    const row = await screen.findByRole("link", { name: /^Sync/ });
    await waitFor(() => {
      expect(row).toHaveTextContent("Up to date · 4 min ago");
    });
    await userEvent.setup().click(row);
    expect(await screen.findByRole("heading", { name: "Sync" })).toBeInTheDocument();
  });

  it("has Sign out as the last row", async () => {
    open(ROUTES.settings);
    const items = await screen.findAllByRole("button", { name: /Sign out/ });
    expect(items).toHaveLength(1);
    const all = screen.getAllByRole("link").concat(screen.getAllByRole("button"));
    const last = all.reduce((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? b : a,
    );
    expect(last).toBe(items[0]);
  });
});

describe("Sign out dialog", () => {
  const openDialog = async () => {
    open(ROUTES.settings);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Sign out" }));
    return { user, dialog: await screen.findByRole("dialog") };
  };

  it("says what signing out removes and what stays on the server", async () => {
    const { dialog } = await openDialog();
    expect(within(dialog).getByText("Sign out?")).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        /signing out removes it from here\. The encrypted backup on .* is untouched\./,
      ),
    ).toBeInTheDocument();
    for (const row of ["Session token cleared", "PIN removed from this phone"]) {
      expect(within(dialog).getByText(row)).toBeInTheDocument();
    }
    expect(within(dialog).getByText(/^Vault untouched on /)).toBeInTheDocument();
    expect(
      within(dialog).getByText("You will need your password to sign in again, then a new PIN."),
    ).toBeInTheDocument();
  });

  it("does not warn about lost changes when everything is synced", async () => {
    const { dialog } = await openDialog();
    expect(within(dialog).queryByText(/haven't synced yet/)).toBeNull();
  });

  it("warns that unsynced changes will be lost when they are not on the server", async () => {
    state$.next(stateWith({ status: "offline" }));
    const { dialog } = await openDialog();
    expect(
      within(dialog).getByText(/Changes that haven't synced yet will be lost\./),
    ).toBeInTheDocument();
  });

  it("closes on Cancel and stays signed in", async () => {
    const { user, dialog } = await openDialog();
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
  });

  it("signs out on confirm and lands on the login screen", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    const { user, dialog } = await openDialog();
    await user.click(within(dialog).getByRole("button", { name: "Sign out" }));
    expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
  });
});

describe("Settings › Sync", () => {
  it("names its parent and shows the status card", async () => {
    open(ROUTES.settingsSync);
    expect(await screen.findByRole("heading", { name: "Sync" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Settings" })).toHaveAttribute(
      "href",
      ROUTES.settings,
    );
    await waitFor(() => {
      expect(screen.getByText("4 min ago")).toBeInTheDocument();
    });
    expect(screen.getByText("Up to date")).toBeInTheDocument();
    expect(screen.getByText(/^Today at \d{2}:\d{2} · /)).toBeInTheDocument();
  });

  it("says nothing has synced yet", async () => {
    state$.next(stateWith({ stats: { ...stateWith().stats, lastSyncedAt: null } }));
    open(ROUTES.settingsSync);
    expect(await screen.findByText("Not yet")).toBeInTheDocument();
  });

  it("counts what is in the vault", async () => {
    await addEntry({
      kind: EntryKind.Password,
      title: "Bank",
      username: "j",
      password: fakeSecret(),
      url: "",
      notes: "",
    });
    await addEntry({
      kind: EntryKind.Password,
      title: "Mail",
      username: "j",
      password: fakeSecret(),
      url: "",
      notes: "",
    });
    await addEntry({ kind: EntryKind.Note, title: "Wifi", body: "x" });
    open(ROUTES.settingsSync);
    const card = await sectionOf("WHAT SYNCED");
    await waitFor(() => {
      expect(within(card).getByText("2 items")).toBeInTheDocument();
    });
    expect(within(card).getByText("1 note")).toBeInTheDocument();
  });

  it("shows how many items moved each way since sign in", async () => {
    open(ROUTES.settingsSync);
    const card = await sectionOf("SINCE YOU SIGNED IN");
    await waitFor(() => {
      expect(within(card).getByText("4 up · 3 down")).toBeInTheDocument();
    });
    expect(within(card).getByText("2 up · 0 down")).toBeInTheDocument();
    expect(within(card).getByText("1 up · 5 down")).toBeInTheDocument();
  });

  it("syncs on demand and shows it is working", async () => {
    let finish: () => void = () => undefined;
    syncNow.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    open(ROUTES.settingsSync);
    await userEvent.setup().click(await screen.findByRole("button", { name: "Sync now" }));
    expect(syncNow).toHaveBeenCalledOnce();
    expect(await screen.findByRole("button", { name: "Syncing" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    finish();
    expect(await screen.findByRole("button", { name: "Sync now" })).toBeInTheDocument();
  });

  it("shows when the server can't be reached, and a server problem with its message", async () => {
    state$.next(stateWith({ status: "offline" }));
    open(ROUTES.settingsSync);
    expect(await screen.findByText("Offline")).toBeInTheDocument();
    state$.next(stateWith({ status: "error", error: "Something went wrong. Try again." }));
    expect(await screen.findByText("Something went wrong. Try again.")).toBeInTheDocument();
  });

  it("explains an ended session, stops syncing and says so once", async () => {
    const error = vi.spyOn(toast, "error");
    state$.next(
      stateWith({
        status: "ended",
        error: "Your session ended, probably because you signed in on another device.",
      }),
    );
    open(ROUTES.settingsSync);
    const button = await screen.findByRole("button", { name: "Sync now" });
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
    await waitFor(() => {
      expect(error).toHaveBeenCalledTimes(1);
    });
  });
});

describe("sync in the unlocked zone", () => {
  it("shows the status pill on the vault screen, and offline is a pill, not a screen", async () => {
    open(ROUTES.home);
    expect(await screen.findByRole("status", { name: "Sync status: Synced" })).toBeInTheDocument();
    state$.next(stateWith({ status: "offline" }));
    expect(
      await screen.findByRole("status", { name: "Sync status: Offline · changes will sync later" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add item" })).toBeInTheDocument();
  });

  it("starts once when unlocked, keeps running between screens, and stops on lock", async () => {
    open(ROUTES.home);
    const user = userEvent.setup();
    await screen.findByRole("status", { name: "Sync status: Synced" });
    await user.click(screen.getByRole("link", { name: "Settings" }));
    await screen.findByRole("heading", { name: "Settings" });
    await user.click(screen.getByRole("link", { name: "Back" }));
    expect(startVaultSync).toHaveBeenCalledTimes(1);
    expect(stop).not.toHaveBeenCalled();

    await user.click(await screen.findByRole("button", { name: "Lock" }));
    expect(await screen.findByRole("heading", { name: "PiVault is locked" })).toBeInTheDocument();
    await waitFor(() => {
      expect(stop).toHaveBeenCalled();
    });
  });

  it("tells the user when sync cannot start", async () => {
    const error = vi.spyOn(toast, "error");
    vi.mocked(startVaultSync).mockRejectedValue(new Error("boom"));
    open(ROUTES.home);
    await waitFor(() => {
      expect(error).toHaveBeenCalledWith("Something went wrong. Try again.");
    });
    expect(
      await screen.findByRole("status", { name: "Sync status: Sync problem" }),
    ).toBeInTheDocument();
  });
});
