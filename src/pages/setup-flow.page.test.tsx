import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import type * as AppLockConstants from "@/constants/app-lock.constants";
import { BIOMETRIC_MESSAGES } from "@/constants/auth.constants";
import { ApiErrorKind } from "@/enums/api.enum";
import { EntryKind } from "@/enums/vault.enum";
import { ROUTES } from "@/routes/route-paths";
import type { SessionRecord } from "@/schemas/session.schema";
import type { SyncDocument } from "@/schemas/sync.schema";
import { ApiError } from "@/services/api.error";
import { getBiometricCredentialId, hasPin, setPin } from "@/services/app-lock.service";
import * as auth from "@/services/auth.service";
import { encryptJson, generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { loadVaultKey, saveVaultKey } from "@/services/key-store.service";
import { clearUnlockedKey, isUnlocked } from "@/services/secure-memory.service";
import { loadSession, saveSession } from "@/services/session.service";
import * as syncApi from "@/services/sync.api";
import type * as SyncModule from "@/services/vault-sync.service";
import { startVaultSync } from "@/services/vault-sync.service";
import * as download from "@/utils/download.utils";
import { FakeVaultServer } from "@/test/fake-vault-server";
import { runAsInstalledApp } from "@/test/pwa-environment";
import { newId } from "@/utils/id.utils";
import { formatRecoveryKey } from "@/utils/recovery-key.utils";
import { entryAad } from "@/utils/vault.utils";

// 600k PBKDF2 rounds per PIN would make these tests crawl.
vi.mock("@/constants/app-lock.constants", async (importOriginal) => ({
  ...(await importOriginal<typeof AppLockConstants>()),
  PBKDF2_ITERATIONS: 1000,
}));

const PIN = "135792";
const SESSION: SessionRecord = {
  userId: "01JABC",
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  token: "t".repeat(43),
  expiresAt: "2099-12-15T10:00:00.000Z",
  recoveryKeyConfigured: false,
  setupDone: false,
};

const open = (path: string = ROUTES.home) => {
  window.history.pushState(null, "", path);
  return render(<App />);
};
const heading = (name: string | RegExp, timeout = 1000) =>
  screen.findByRole("heading", { name }, { timeout });
const press = async (user: ReturnType<typeof userEvent.setup>, pin: string) => {
  for (const digit of pin) await user.click(await screen.findByRole("button", { name: digit }));
};
/** Types the PIN twice, as the two steps ask. */
const setUpPin = async (user: ReturnType<typeof userEvent.setup>, pin = PIN) => {
  await heading("Set your app PIN");
  await press(user, pin);
  await heading("Confirm your PIN");
  await press(user, pin);
};
const shownKey = async (): Promise<(string | null)[]> =>
  within(await screen.findByRole("list", { name: "Recovery key" }))
    .getAllByRole("listitem")
    .map((item) => item.textContent);

beforeEach(async () => {
  runAsInstalledApp();
  await saveSession(SESSION);
});
afterEach(() => {
  clearUnlockedKey();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, "credentials");
});

describe("first sign in: set the PIN", () => {
  it("starts with step 1 of 2 and the six empty cells", async () => {
    open();
    expect(await heading("Set your app PIN")).toBeInTheDocument();
    expect(screen.getByText("STEP 1 OF 2")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Step 1 of 2" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "0 of 6 digits entered" })).toBeInTheDocument();
    expect(screen.getByText(/It only guards this app on this device/)).toBeInTheDocument();
  });

  it("moves to the confirmation by itself, then on to the recovery key", async () => {
    const user = userEvent.setup();
    open();
    await setUpPin(user);
    expect(await heading("Your recovery key")).toBeInTheDocument();
    expect(await hasPin()).toBe(true);
  });

  it("refuses an easy-to-guess PIN and stays on step 1", async () => {
    const user = userEvent.setup();
    open();
    await heading("Set your app PIN");
    await press(user, "123456");
    expect(await screen.findByText("Pick a PIN that's harder to guess.")).toBeInTheDocument();
    expect(screen.getByText("STEP 1 OF 2")).toBeInTheDocument();
  });

  it("starts the confirmation over when the two entries don't match", async () => {
    const user = userEvent.setup();
    open();
    await heading("Set your app PIN");
    await press(user, PIN);
    await heading("Confirm your PIN");
    expect(screen.getByText("STEP 2 OF 2")).toBeInTheDocument();
    await press(user, "246801");
    expect(
      await screen.findByText("Those didn't match. Enter the same PIN again."),
    ).toBeInTheDocument();
    expect(await hasPin()).toBe(false);

    await press(user, PIN);
    expect(await heading("Your recovery key")).toBeInTheDocument();
  });

  it("carries on to the recovery key when a PIN is already saved", async () => {
    await setPin(PIN);
    open();
    expect(await heading("Your recovery key")).toBeInTheDocument();
  });

  describe("Face ID offer", () => {
    const supportFaceId = (create: () => Promise<unknown>) => {
      class Fake {
        rawId = Uint8Array.of(1, 2, 3).buffer;
        static isUserVerifyingPlatformAuthenticatorAvailable = () => Promise.resolve(true);
      }
      vi.stubGlobal("PublicKeyCredential", Fake);
      Object.defineProperty(navigator, "credentials", { configurable: true, value: { create } });
      return Fake;
    };

    it("is not made on a device without it", async () => {
      const user = userEvent.setup();
      open();
      await setUpPin(user);
      expect(await heading("Your recovery key")).toBeInTheDocument();
      expect(screen.queryByText("Turn on Face ID?")).toBeNull();
    });

    it("enrolls when the user says yes", async () => {
      const Fake = supportFaceId(() => Promise.resolve(new Fake()));
      const user = userEvent.setup();
      open();
      await setUpPin(user);
      await user.click(await screen.findByRole("button", { name: "Turn on Face ID" }));
      expect(await heading("Your recovery key")).toBeInTheDocument();
      expect(await getBiometricCredentialId()).not.toBeNull();
    });

    it("keeps the PIN and carries on when the user says not now", async () => {
      const create = vi.fn();
      supportFaceId(create);
      const user = userEvent.setup();
      open();
      await setUpPin(user);
      await user.click(await screen.findByRole("button", { name: "Not now" }));
      expect(await heading("Your recovery key")).toBeInTheDocument();
      expect(create).not.toHaveBeenCalled();
      expect(await hasPin()).toBe(true);
    });

    it("says so and carries on when enrolling fails", async () => {
      const error = vi.spyOn(toast, "error");
      supportFaceId(() => Promise.reject(new DOMException("no", "NotAllowedError")));
      const user = userEvent.setup();
      open();
      await setUpPin(user);
      await user.click(await screen.findByRole("button", { name: "Turn on Face ID" }));
      expect(await heading("Your recovery key")).toBeInTheDocument();
      expect(error).toHaveBeenCalledWith(BIOMETRIC_MESSAGES.failed);
      expect(await getBiometricCredentialId()).toBeNull();
    });
  });
});

describe("first sign in: the recovery key", () => {
  beforeEach(async () => {
    await setPin(PIN);
  });

  it("shows the new key in groups, and keeps Continue disabled until it is saved", async () => {
    open();
    const groups = await shownKey();
    expect(groups).toHaveLength(8);
    for (const group of groups) expect(group).toMatch(/^[0-9a-f]{8}$/);
    expect(screen.getByText("SETUP · STEP 3 OF 3")).toBeInTheDocument();
    const next = screen.getByRole("button", { name: "Continue" });
    expect(next).toBeDisabled();
    await userEvent
      .setup()
      .click(screen.getByRole("checkbox", { name: "I've saved it somewhere safe" }));
    expect(next).toBeEnabled();
  });

  it("copies the key, and offers it as a text file", async () => {
    const save = vi.spyOn(download, "downloadText").mockImplementation(() => undefined);
    open();
    const user = userEvent.setup();
    const groups = await shownKey();
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(await navigator.clipboard.readText()).toBe(groups.join("-"));
    await user.click(screen.getByRole("button", { name: "Download" }));
    expect(save).toHaveBeenCalledWith(
      "pivault-recovery-key.txt",
      expect.stringContaining(groups.join("-")),
    );
  });

  it("finishes only after the second and fourth groups are typed back, then opens the app unlocked", async () => {
    const server = vi.spyOn(auth, "markRecoveryKeyConfigured").mockResolvedValue();
    open();
    const user = userEvent.setup();
    const groups = await shownKey();
    await user.click(screen.getByRole("checkbox", { name: "I've saved it somewhere safe" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await heading("Prove you saved it")).toBeInTheDocument();
    const finish = screen.getByRole("button", { name: "Finish setup" });
    expect(finish).toBeDisabled();
    await user.type(screen.getByLabelText("Group 2"), "00000000");
    await user.type(screen.getByLabelText("Group 4"), groups[3] ?? "");
    expect(finish).toBeDisabled();
    await user.clear(screen.getByLabelText("Group 2"));
    await user.type(screen.getByLabelText("Group 2"), (groups[1] ?? "").toUpperCase());
    expect(finish).toBeEnabled();
    await user.click(finish);

    expect(await heading("Vault")).toBeInTheDocument();
    expect(server).toHaveBeenCalledOnce();
    expect((await loadVaultKey())?.extractable).toBe(false);
    expect((await loadSession())?.setupDone).toBe(true);
    expect(isUnlocked()).toBe(true);
  });

  it("shows the same key again when the user goes back", async () => {
    open();
    const user = userEvent.setup();
    const groups = await shownKey();
    await user.click(screen.getByRole("checkbox", { name: "I've saved it somewhere safe" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(await screen.findByRole("button", { name: "Show me the key again" }));
    expect(await shownKey()).toEqual(groups);
  });

  it("stays put and explains when the server can't be reached", async () => {
    const error = vi.spyOn(toast, "error");
    vi.spyOn(auth, "markRecoveryKeyConfigured").mockRejectedValue(
      new ApiError(ApiErrorKind.Network, "Offline"),
    );
    open();
    const user = userEvent.setup();
    const groups = await shownKey();
    await user.click(screen.getByRole("checkbox", { name: "I've saved it somewhere safe" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(await screen.findByLabelText("Group 2"), groups[1] ?? "");
    await user.type(screen.getByLabelText("Group 4"), groups[3] ?? "");
    await user.click(screen.getByRole("button", { name: "Finish setup" }));

    await waitFor(() => {
      expect(error).toHaveBeenCalledWith("Offline");
    });
    expect(screen.getByRole("heading", { name: "Prove you saved it" })).toBeInTheDocument();
    await expect(loadVaultKey()).resolves.toBeNull();
  });
});

describe("new phone: recover the vault", () => {
  let server: FakeVaultServer;
  let hex: string;
  const sealed = async (key: CryptoKey, title: string, id = newId()): Promise<SyncDocument> => ({
    id,
    updatedAt: Date.now(),
    _deleted: false,
    envelope: await encryptJson(key, { kind: EntryKind.Note, title, body: "x" }, entryAad(id)),
  });
  const fillKey = async (user: ReturnType<typeof userEvent.setup>, key: string) => {
    await user.click(await screen.findByLabelText("Recovery key, group 1 of 8"));
    await user.paste(formatRecoveryKey(key).toUpperCase());
  };

  beforeEach(async () => {
    server = new FakeVaultServer();
    hex = generateRecoveryKey();
    const key = await importRecoveryKey(hex);
    for (const title of ["Wifi", "Bank", "Mail"]) server.put(await sealed(key, title));
    vi.spyOn(syncApi, "pullChanges").mockImplementation((checkpoint, limit) =>
      Promise.resolve(server.pull(checkpoint, limit)),
    );
    vi.spyOn(syncApi, "pushChanges").mockImplementation((rows) =>
      Promise.resolve(server.push(rows)),
    );
    // The rebuild uses the real sync (screens otherwise get the stub from the test setup).
    const actual = await vi.importActual<typeof SyncModule>("@/services/vault-sync.service");
    vi.mocked(startVaultSync).mockImplementation(() => actual.startVaultSync({ retryMs: 20 }));
    await saveSession({ ...SESSION, recoveryKeyConfigured: true });
  });

  it("asks for the existing key, with eight boxes and the account email", async () => {
    open();
    expect(await heading("Enter your recovery key")).toBeInTheDocument();
    expect(
      await screen.findByText(/Signed in as jane@example\.com\. This phone has no vault key yet/),
    ).toBeInTheDocument();
    expect(await screen.findAllByRole("textbox")).toHaveLength(8);
    expect(await screen.findByRole("button", { name: "Recover my vault" })).toBeDisabled();
    expect(screen.getByText(/Paste the whole key into the first box/)).toBeInTheDocument();
  });

  it("says all the characters are needed when Enter is pressed early", async () => {
    open();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Recovery key, group 1 of 8"), "0123{Enter}");
    expect(await screen.findByText("All sixty-four characters are needed.")).toBeInTheDocument();
  });

  it("explains a key that does not match the server's vault, inline and without a toast", async () => {
    const error = vi.spyOn(toast, "error");
    open();
    const user = userEvent.setup();
    await fillKey(user, generateRecoveryKey());
    await user.click(screen.getByRole("button", { name: "Recover my vault" }));
    expect(
      await screen.findByText("That key does not match any vault on this server."),
    ).toBeInTheDocument();
    expect(error).not.toHaveBeenCalled();
    await expect(loadVaultKey()).resolves.toBeNull();
  });

  it("rebuilds the vault with progress, then sets a PIN and opens it with the records in place", async () => {
    open();
    const user = userEvent.setup();
    await fillKey(user, hex);
    await user.click(screen.getByRole("button", { name: "Recover my vault" }));

    expect(await heading("Rebuilding your vault")).toBeInTheDocument();
    expect(screen.getByText("KEY ACCEPTED")).toBeInTheDocument();
    expect(screen.getByText("Vault key unwrapped")).toBeInTheDocument();
    expect(await heading("Set your app PIN", 5000)).toBeInTheDocument();

    await setUpPin(user);
    expect(await heading("Vault")).toBeInTheDocument();
    const list = await screen.findByRole("list", { name: "Vault items" });
    await waitFor(() => {
      expect(within(list).getAllByRole("button")).toHaveLength(3);
    });
    expect((await loadSession())?.setupDone).toBe(true);
    expect(isUnlocked()).toBe(true);
  });

  it("offers to try again when the rebuild can't reach the server", async () => {
    let online = true;
    vi.spyOn(syncApi, "pullChanges").mockImplementation((checkpoint, limit) => {
      if (online) return Promise.resolve(server.pull(checkpoint, limit));
      return Promise.reject(new ApiError(ApiErrorKind.Network, "Can't reach PiVault."));
    });
    await saveVaultKey(await importRecoveryKey(hex));
    online = false;
    open();
    expect(
      await screen.findByText(/Can't reach PiVault/, undefined, { timeout: 4000 }),
    ).toBeInTheDocument();
    online = true;
    await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
    expect(await heading("Set your app PIN", 5000)).toBeInTheDocument();
  });

  it("carries on at the rebuild after a reload once the key is saved", async () => {
    await saveVaultKey(await importRecoveryKey(hex));
    open();
    expect(await heading("Set your app PIN", 5000)).toBeInTheDocument();
  });

  it("finishes by itself when the key and the PIN are both in place", async () => {
    await saveVaultKey(await importRecoveryKey(hex));
    await setPin(PIN);
    open();
    expect(await heading("Vault")).toBeInTheDocument();
    expect((await loadSession())?.setupDone).toBe(true);
  });
});

describe("after setup", () => {
  it("signing out from Settings wipes the device and returns to sign in", async () => {
    vi.spyOn(auth, "markRecoveryKeyConfigured").mockResolvedValue();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    await setPin(PIN);
    open();
    const user = userEvent.setup();
    const groups = await shownKey();
    await user.click(screen.getByRole("checkbox", { name: "I've saved it somewhere safe" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(await screen.findByLabelText("Group 2"), groups[1] ?? "");
    await user.type(screen.getByLabelText("Group 4"), groups[3] ?? "");
    await user.click(screen.getByRole("button", { name: "Finish setup" }));
    await user.click(await screen.findByRole("link", { name: "Settings" }));
    await user.click(await screen.findByRole("button", { name: "Sign out" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Sign out" }),
    );

    expect(await heading("Sign in")).toBeInTheDocument();
    await waitFor(async () => {
      expect(await loadSession()).toBeNull();
    });
    await expect(loadVaultKey()).resolves.toBeNull();
    expect(await hasPin()).toBe(false);
    expect(isUnlocked()).toBe(false);
  });
});
