import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import type * as AppLockConstants from "@/constants/app-lock.constants";
import { BIOMETRIC_MESSAGES } from "@/constants/auth.constants";
import { ApiErrorKind } from "@/enums/api.enum";
import { ROUTES } from "@/routes/route-paths";
import type { SessionRecord } from "@/schemas/session.schema";
import { ApiError } from "@/services/api.error";
import { getBiometricCredentialId, hasPin, setPin } from "@/services/app-lock.service";
import * as auth from "@/services/auth.service";
import * as syncApi from "@/services/sync.api";
import { encryptJson, generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { newId } from "@/utils/id.utils";
import { entryAad } from "@/utils/vault.utils";
import { loadVaultKey } from "@/services/key-store.service";
import { isUnlocked } from "@/services/secure-memory.service";
import { loadSession, saveSession } from "@/services/session.service";
import { runAsInstalledApp } from "@/test/pwa-environment";

// 600k PBKDF2 rounds per PIN would make these tests crawl.
vi.mock("@/constants/app-lock.constants", async (importOriginal) => ({
  ...(await importOriginal<typeof AppLockConstants>()),
  PBKDF2_ITERATIONS: 1000,
}));

const SESSION: SessionRecord = {
  userId: "01JABC",
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  token: "t".repeat(43),
  expiresAt: "2026-12-15T10:00:00.000Z",
  recoveryKeyConfigured: false,
  setupDone: false,
};
const PIN = "135792";

const open = (path: string) => {
  window.history.pushState(null, "", path);
  return render(<App />);
};
const heading = (name: string) => screen.findByRole("heading", { name });

/** Types the PIN twice, which is what the setup asks for. */
const enterPin = async (user: ReturnType<typeof userEvent.setup>, pin = PIN) => {
  await user.type(await screen.findByLabelText("Create your PIN"), pin);
  await user.type(await screen.findByLabelText("Confirm your PIN"), pin);
};

beforeEach(async () => {
  runAsInstalledApp();
  await saveSession(SESSION);
});
afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, "credentials");
});

describe("app lock step", () => {
  it("saves the PIN and moves on to the recovery key", async () => {
    open(ROUTES.setupAppLock);
    const user = userEvent.setup();
    await enterPin(user);
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await heading("Save your recovery key")).toBeInTheDocument();
    expect(await hasPin()).toBe(true);
  });

  it("does not let Continue through before the PIN is confirmed", async () => {
    open(ROUTES.setupAppLock);
    const user = userEvent.setup();
    expect(await screen.findByRole("button", { name: "Continue" })).toBeDisabled();
    await user.type(screen.getByLabelText("Create your PIN"), PIN);
    expect(await screen.findByLabelText("Confirm your PIN")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("refuses an easy-to-guess PIN", async () => {
    open(ROUTES.setupAppLock);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Create your PIN"), "123456");
    expect(await screen.findByText("Pick a PIN that's harder to guess.")).toBeInTheDocument();
    expect(screen.getByLabelText("Create your PIN")).toBeInTheDocument();
  });

  it("starts over when the confirmation does not match", async () => {
    open(ROUTES.setupAppLock);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Create your PIN"), PIN);
    await user.type(await screen.findByLabelText("Confirm your PIN"), "246801");
    expect(await screen.findByText("The PINs didn't match. Start again.")).toBeInTheDocument();
    expect(screen.getByLabelText("Create your PIN")).toBeInTheDocument();
    expect(await hasPin()).toBe(false);
  });

  it("lets the user change the PIN before continuing", async () => {
    open(ROUTES.setupAppLock);
    const user = userEvent.setup();
    await enterPin(user);
    await user.click(screen.getByRole("button", { name: "Change PIN" }));
    expect(await screen.findByLabelText("Create your PIN")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("carries on to the recovery key when a PIN is already saved", async () => {
    await setPin(PIN);
    open(ROUTES.setupAppLock);
    expect(await heading("Save your recovery key")).toBeInTheDocument();
  });

  describe("biometrics", () => {
    const supportBiometrics = (create: () => Promise<unknown>) => {
      class Fake {
        rawId = Uint8Array.of(1, 2, 3).buffer;
        static isUserVerifyingPlatformAuthenticatorAvailable = () => Promise.resolve(true);
      }
      vi.stubGlobal("PublicKeyCredential", Fake);
      Object.defineProperty(navigator, "credentials", { configurable: true, value: { create } });
      return Fake;
    };

    it("offers the choice only on a device that supports it, and only after the PIN is set", async () => {
      open(ROUTES.setupAppLock);
      const user = userEvent.setup();
      await enterPin(user);
      expect(screen.queryByRole("switch", { name: "Unlock with biometrics" })).toBeNull();
    });

    it("enrolls when switched on", async () => {
      const Fake = supportBiometrics(() => Promise.resolve(new Fake()));
      open(ROUTES.setupAppLock);
      const user = userEvent.setup();
      await enterPin(user);
      await user.click(await screen.findByRole("switch", { name: "Unlock with biometrics" }));
      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(await heading("Save your recovery key")).toBeInTheDocument();
      expect(await getBiometricCredentialId()).not.toBeNull();
    });

    it("keeps the PIN and says so when enrolling fails", async () => {
      const error = vi.spyOn(toast, "error");
      supportBiometrics(() => Promise.reject(new DOMException("no", "NotAllowedError")));
      open(ROUTES.setupAppLock);
      const user = userEvent.setup();
      await enterPin(user);
      await user.click(await screen.findByRole("switch", { name: "Unlock with biometrics" }));
      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(await heading("Save your recovery key")).toBeInTheDocument();
      expect(error).toHaveBeenCalledWith(BIOMETRIC_MESSAGES.failed);
      expect(await hasPin()).toBe(true);
      expect(await getBiometricCredentialId()).toBeNull();
    });
  });
});

describe("recovery key step: first login", () => {
  const open_ = () => open(ROUTES.setupRecoveryKey);

  const keyGroups = async () =>
    within(await screen.findByRole("list", { name: "Recovery key" })).getAllByRole("listitem");

  it("shows a new key as 8 groups of 8 and keeps Finish disabled until it is saved", async () => {
    open_();
    const groups = await keyGroups();
    expect(groups).toHaveLength(8);
    for (const group of groups) expect(group.textContent).toMatch(/^[0-9a-f]{8}$/);
    const finish = screen.getByRole("button", { name: "Finish setup" });
    expect(finish).toBeDisabled();
    await userEvent
      .setup()
      .click(screen.getByRole("switch", { name: /I've saved my recovery key/ }));
    expect(finish).toBeEnabled();
  });

  it("copies the key in its display format", async () => {
    open_();
    const user = userEvent.setup();
    const groups = await keyGroups();
    await user.click(screen.getByRole("button", { name: "Copy key" }));
    expect(await navigator.clipboard.readText()).toBe(groups.map((g) => g.textContent).join("-"));
  });

  it("finishes: tells the server, keeps a non-extractable key and opens the app unlocked", async () => {
    const server = vi.spyOn(auth, "markRecoveryKeyConfigured").mockResolvedValue();
    open_();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("switch", { name: /I've saved my recovery key/ }));
    await user.click(screen.getByRole("button", { name: "Finish setup" }));

    expect(await heading("Vault")).toBeInTheDocument();
    expect(server).toHaveBeenCalledOnce();
    expect((await loadVaultKey())?.extractable).toBe(false);
    expect((await loadSession())?.setupDone).toBe(true);
    expect(isUnlocked()).toBe(true);
  });

  it("stays put and explains when the server can't be reached", async () => {
    const error = vi.spyOn(toast, "error");
    vi.spyOn(auth, "markRecoveryKeyConfigured").mockRejectedValue(
      new ApiError(ApiErrorKind.Network, "Offline"),
    );
    open_();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("switch", { name: /I've saved my recovery key/ }));
    await user.click(screen.getByRole("button", { name: "Finish setup" }));

    await waitFor(() => {
      expect(error).toHaveBeenCalledWith("Offline");
    });
    expect(screen.getByRole("heading", { name: "Save your recovery key" })).toBeInTheDocument();
    await expect(loadVaultKey()).resolves.toBeNull();
    expect(screen.getByRole("button", { name: "Finish setup" })).toBeEnabled();
  });
});

describe("recovery key step: new device", () => {
  beforeEach(async () => {
    await saveSession({ ...SESSION, recoveryKeyConfigured: true });
  });

  it("asks for the existing key instead of making a new one", async () => {
    open(ROUTES.setupRecoveryKey);
    expect(await heading("Enter your recovery key")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Recovery key" })).toBeNull();
  });

  it("explains a mistyped key inline, without a toast", async () => {
    const error = vi.spyOn(toast, "error");
    open(ROUTES.setupRecoveryKey);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Recovery key"), "abc");
    await user.click(screen.getByRole("button", { name: "Unlock vault" }));

    expect(await screen.findByText(/recovery key isn't valid/)).toBeInTheDocument();
    expect(error).not.toHaveBeenCalled();
    await expect(loadVaultKey()).resolves.toBeNull();
  });

  it("explains a key that doesn't open the vault on the server", async () => {
    const error = vi.spyOn(toast, "error");
    const id = newId();
    const other = await importRecoveryKey(generateRecoveryKey());
    vi.spyOn(syncApi, "pullChanges").mockResolvedValue({
      documents: [
        {
          id,
          updatedAt: 1,
          _deleted: false,
          envelope: await encryptJson(other, { kind: "note", title: "t", body: "b" }, entryAad(id)),
        },
      ],
      checkpoint: { seq: 1 },
    });
    open(ROUTES.setupRecoveryKey);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Recovery key"), generateRecoveryKey());
    await user.click(screen.getByRole("button", { name: "Unlock vault" }));

    expect(await screen.findByText(/doesn't unlock this vault/)).toBeInTheDocument();
    expect(error).not.toHaveBeenCalled();
    await expect(loadVaultKey()).resolves.toBeNull();
  });

  it("accepts the saved key without calling the server, and opens the app", async () => {
    vi.spyOn(syncApi, "pullChanges").mockResolvedValue({ documents: [], checkpoint: { seq: 0 } });
    const server = vi.spyOn(auth, "markRecoveryKeyConfigured");
    open(ROUTES.setupRecoveryKey);
    const user = userEvent.setup();
    const key = generateRecoveryKey().replace(/(.{8})(?!$)/g, "$1-");
    await user.type(await screen.findByLabelText("Recovery key"), key);
    await user.click(screen.getByRole("button", { name: "Unlock vault" }));

    expect(await heading("Vault")).toBeInTheDocument();
    expect(server).not.toHaveBeenCalled();
    expect(await loadVaultKey()).not.toBeNull();
  });
});

describe("after setup", () => {
  it("signing out wipes the device and returns to login", async () => {
    vi.spyOn(auth, "markRecoveryKeyConfigured").mockResolvedValue();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    await setPin(PIN);
    open(ROUTES.setupRecoveryKey);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("switch", { name: /I've saved my recovery key/ }));
    await user.click(screen.getByRole("button", { name: "Finish setup" }));
    await user.click(await screen.findByRole("link", { name: "Settings" }));
    await user.click(await screen.findByRole("button", { name: "Sign out" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Sign out" }),
    );

    expect(await heading("Welcome back")).toBeInTheDocument();
    await waitFor(async () => {
      expect(await loadSession()).toBeNull();
    });
    await expect(loadVaultKey()).resolves.toBeNull();
    expect(await hasPin()).toBe(false);
    expect(isUnlocked()).toBe(false);
  });
});
