import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import type * as AppLockConstants from "@/constants/app-lock.constants";
import { LOCK_COPY, LOCK_MESSAGES } from "@/constants/lock.constants";
import { ROUTES } from "@/routes/route-paths";
import type { SessionRecord } from "@/schemas/session.schema";
import { hasPin, setBiometric, setPin } from "@/services/app-lock.service";
import * as biometric from "@/services/biometric.service";
import { generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { loadVaultKey, saveVaultKey } from "@/services/key-store.service";
import { clearUnlockedKey, isUnlocked } from "@/services/secure-memory.service";
import { loadSession, saveSession } from "@/services/session.service";
import { runAsInstalledApp } from "@/test/pwa-environment";

vi.mock("@/constants/app-lock.constants", async (importOriginal) => ({
  ...(await importOriginal<typeof AppLockConstants>()),
  PBKDF2_ITERATIONS: 1000,
}));

const PIN = "135792";
const WRONG = "246801";
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

const heading = (name: string) => screen.findByRole("heading", { name });
const open = () => {
  window.history.pushState(null, "", ROUTES.home);
  return render(<App />);
};
const pinBoxes = () => screen.findByLabelText(LOCK_COPY.pinLabel);

beforeEach(async () => {
  runAsInstalledApp();
  await saveSession(SESSION);
  await setPin(PIN);
  await saveVaultKey(await importRecoveryKey(generateRecoveryKey()));
});
afterEach(() => {
  clearUnlockedKey();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, "credentials");
});

describe("lock screen", () => {
  it("is where a set up user lands, and unlocks on the sixth digit", async () => {
    open();
    expect(await heading(LOCK_COPY.title)).toBeInTheDocument();
    await userEvent.setup().type(await pinBoxes(), PIN);

    expect(await heading("Vault")).toBeInTheDocument();
    expect(isUnlocked()).toBe(true);
    expect(await screen.findByText(/jane@example\.com/)).toBeInTheDocument();
  });

  it("tells the user how many tries are left and clears the boxes", async () => {
    open();
    const user = userEvent.setup();
    await user.type(await pinBoxes(), WRONG);
    expect(
      await screen.findByText("Wrong PIN. 4 tries left before a timeout."),
    ).toBeInTheDocument();
    expect(isUnlocked()).toBe(false);
    expect(await pinBoxes()).toHaveValue("");

    await user.type(await pinBoxes(), PIN);
    expect(await heading("Vault")).toBeInTheDocument();
  });

  it("locks the PIN boxes with a countdown after too many wrong tries", async () => {
    open();
    const user = userEvent.setup();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await user.type(await pinBoxes(), WRONG);
      await waitFor(() => {
        expect(screen.getByLabelText(LOCK_COPY.pinLabel)).toHaveValue("");
      });
    }
    expect(await screen.findByText(/Too many attempts\. Try again in 0:30\./)).toBeInTheDocument();
    expect(await pinBoxes()).toBeDisabled();
    expect(isUnlocked()).toBe(false);
  });

  it("signs out and says so when the device lost the vault key", async () => {
    const error = vi.spyOn(toast, "error");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    await (await import("@/services/key-store.service")).clearVaultKey();
    open();
    await userEvent.setup().type(await pinBoxes(), PIN);

    expect(await heading("Welcome back")).toBeInTheDocument();
    expect(error).toHaveBeenCalledWith(LOCK_MESSAGES.vaultKeyMissing);
    expect(isUnlocked()).toBe(false);
  });

  it("lets the user sign out from the lock screen", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    open();
    await userEvent.setup().click(await screen.findByRole("button", { name: "Sign out" }));
    expect(await heading("Welcome back")).toBeInTheDocument();
    await waitFor(async () => {
      expect(await loadSession()).toBeNull();
    });
    expect(await hasPin()).toBe(false);
    await expect(loadVaultKey()).resolves.toBeNull();
  });

  describe("biometrics", () => {
    beforeEach(async () => {
      await setBiometric("cred-1");
      vi.stubGlobal("PublicKeyCredential", {
        isUserVerifyingPlatformAuthenticatorAvailable: () => Promise.resolve(true),
      });
    });

    it("prompts on open and unlocks when the device confirms", async () => {
      const verify = vi.spyOn(biometric, "verifyBiometric").mockResolvedValue(true);
      open();
      expect(await heading("Vault")).toBeInTheDocument();
      expect(verify).toHaveBeenCalledWith("cred-1");
    });

    it("falls back to the PIN, and the button asks again", async () => {
      const verify = vi
        .spyOn(biometric, "verifyBiometric")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      open();
      const user = userEvent.setup();
      await heading(LOCK_COPY.title);
      await waitFor(() => {
        expect(verify).toHaveBeenCalledTimes(1);
      });
      expect(screen.getByRole("heading", { name: LOCK_COPY.title })).toBeInTheDocument();

      await user.click(await screen.findByRole("button", { name: LOCK_COPY.biometricButton }));
      expect(await heading("Vault")).toBeInTheDocument();
    });

    it("does not show the button on a device without biometrics", async () => {
      vi.stubGlobal("PublicKeyCredential", {
        isUserVerifyingPlatformAuthenticatorAvailable: () => Promise.resolve(false),
      });
      const verify = vi.spyOn(biometric, "verifyBiometric");
      open();
      await heading(LOCK_COPY.title);
      expect(screen.queryByRole("button", { name: LOCK_COPY.biometricButton })).toBeNull();
      expect(verify).not.toHaveBeenCalled();
    });
  });
});
