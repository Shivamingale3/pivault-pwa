import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import type * as AppLockConstants from "@/constants/app-lock.constants";
import { LOCK_COPY } from "@/constants/lock.constants";
import { LOCK_MESSAGES } from "@/constants/lock.constants";
import { ROUTES } from "@/routes/route-paths";
import type { SessionRecord } from "@/schemas/session.schema";
import { hasPin, setBiometric, setPin } from "@/services/app-lock.service";
import * as biometric from "@/services/biometric.service";
import { generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { clearVaultKey, loadVaultKey, saveVaultKey } from "@/services/key-store.service";
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

const heading = (name: string | RegExp) => screen.findByRole("heading", { name });
const open = () => {
  window.history.pushState(null, "", ROUTES.home);
  return render(<App />);
};
const press = async (user: ReturnType<typeof userEvent.setup>, pin: string) => {
  for (const digit of pin) await user.click(await screen.findByRole("button", { name: digit }));
};

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

describe("PIN unlock", () => {
  it("greets the user, and unlocks on the sixth digit with a confirmation", async () => {
    open();
    expect(await heading("Welcome back, Jane")).toBeInTheDocument();
    expect(screen.getByText("Enter your 6-digit PIN")).toBeInTheDocument();
    await press(userEvent.setup(), PIN);

    expect(await screen.findByText("Unlocked")).toBeInTheDocument();
    expect(isUnlocked()).toBe(true);
    expect(await heading("Hello, Jane")).toBeInTheDocument();
  });

  it("also takes digits from a physical keyboard", async () => {
    open();
    await heading("Welcome back, Jane");
    await userEvent.setup().keyboard(PIN);
    expect(await heading("Hello, Jane")).toBeInTheDocument();
  });

  it("masks the digits until Show PIN is on", async () => {
    open();
    const user = userEvent.setup();
    await press(user, "13");
    const cells = screen.getByRole("group", { name: "2 of 6 digits entered" });
    expect(cells).toHaveTextContent("••");
    await user.click(screen.getByRole("button", { name: "Show PIN" }));
    expect(cells).toHaveTextContent("13");
    expect(screen.getByRole("button", { name: "Hide PIN" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("tells the user how many tries are left and clears the cells", async () => {
    open();
    const user = userEvent.setup();
    await press(user, WRONG);
    expect(
      await screen.findByText("Wrong PIN. 4 tries left before a timeout."),
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "0 of 6 digits entered" })).toBeInTheDocument();
    expect(isUnlocked()).toBe(false);

    await press(user, PIN);
    expect(await heading("Hello, Jane")).toBeInTheDocument();
  });

  it("pauses PIN entry after five wrong PINs, with a live wait and a dead keypad", async () => {
    open();
    const user = userEvent.setup();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await press(user, WRONG);
      if (attempt < 4) {
        await waitFor(() => {
          expect(screen.getByRole("group", { name: "0 of 6 digits entered" })).toBeInTheDocument();
        });
      }
    }
    expect(await heading("PIN entry paused")).toBeInTheDocument();
    expect(screen.getByText("PIN AVAILABLE IN")).toBeInTheDocument();
    expect(screen.getByText("Attempt 5 of 5 · next wait 5 min")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /PIN AVAILABLE IN 0:/ })).toHaveAttribute(
      "aria-live",
      "off",
    );
    for (const button of within(screen.getByRole("group", { name: "PIN keypad" })).getAllByRole(
      "button",
    )) {
      expect(button).toBeDisabled();
    }
    expect(isUnlocked()).toBe(false);
  });

  it("offers the password as the way round a pause, after confirming", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    open();
    const user = userEvent.setup();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await press(user, WRONG);
      await waitFor(() => {
        expect(screen.queryByRole("group", { name: /[1-6] of 6 digits/ })).toBeNull();
      });
    }
    await user.click(await screen.findByRole("button", { name: "Sign in with password" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Sign out?")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Sign out" }));
    expect(await heading("Sign in")).toBeInTheDocument();
  });

  it("explains Forgot PIN, and leads to signing in again", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    open();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Forgot PIN?" }));
    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByText(/Resetting a PIN needs your password/)).toBeInTheDocument();
    await user.click(within(sheet).getByRole("button", { name: "Sign in with password" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Sign out" }),
    );
    expect(await heading("Sign in")).toBeInTheDocument();
    await waitFor(async () => {
      expect(await loadSession()).toBeNull();
    });
    expect(await hasPin()).toBe(false);
  });

  it("signs out and says so when the device lost the vault key", async () => {
    const error = vi.spyOn(toast, "error");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    await clearVaultKey();
    open();
    await press(userEvent.setup(), PIN);

    expect(await heading("Sign in")).toBeInTheDocument();
    expect(error).toHaveBeenCalledWith(LOCK_MESSAGES.vaultKeyMissing);
    await expect(loadVaultKey()).resolves.toBeNull();
  });
});

describe("signed in on another device", () => {
  it("says so on the lock screen, and still opens the vault", async () => {
    await saveSession({ ...SESSION, endedElsewhere: true });
    open();
    expect(await screen.findByText(/You signed in on another device/)).toBeInTheDocument();
    await press(userEvent.setup(), PIN);
    expect(await heading("Hello, Jane")).toBeInTheDocument();
  });

  it("says nothing about the session otherwise", async () => {
    open();
    await heading("Welcome back, Jane");
    expect(screen.queryByText(/another device|session/i)).toBeNull();
  });
});

describe("biometrics first", () => {
  beforeEach(async () => {
    await setBiometric("cred-1");
    vi.stubGlobal("PublicKeyCredential", {
      isUserVerifyingPlatformAuthenticatorAvailable: () => Promise.resolve(true),
    });
  });

  it("is the way in when it is on, and confirms with Unlocked", async () => {
    const verify = vi.spyOn(biometric, "verifyBiometric").mockResolvedValue(true);
    open();
    expect(await screen.findByText("Unlocked")).toBeInTheDocument();
    expect(verify).toHaveBeenCalledWith("cred-1");
    expect(await heading("Hello, Jane")).toBeInTheDocument();
  });

  it("shows the invitation while it waits for a tap, with no technical lines", async () => {
    vi.spyOn(biometric, "verifyBiometric").mockResolvedValue(false);
    open();
    expect(await heading("Unlock PiVault")).toBeInTheDocument();
    expect(screen.getByText(LOCK_COPY.faceBody)).toBeInTheDocument();
    expect(screen.queryByText(/session/i)).toBeNull();
  });

  it("shows the failure screen after two misses, and hands over to the PIN after three", async () => {
    const verify = vi.spyOn(biometric, "verifyBiometric").mockResolvedValue(false);
    open();
    const user = userEvent.setup();
    await heading("Unlock PiVault");
    await waitFor(() => {
      expect(verify).toHaveBeenCalledTimes(1);
    });
    await user.click(await screen.findByRole("button", { name: "Unlock PiVault" }));

    expect(await heading("Not recognised")).toBeInTheDocument();
    expect(
      screen.getByText(/Two tries used\. One more and PiVault will ask for your PIN/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await heading("Welcome back, Jane")).toBeInTheDocument();
    expect(verify).toHaveBeenCalledTimes(3);
    expect(screen.getByRole("button", { name: "Unlock with biometrics" })).toBeInTheDocument();
  });

  it("lets the user choose the PIN at any time", async () => {
    vi.spyOn(biometric, "verifyBiometric").mockResolvedValue(false);
    open();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Enter PIN instead" }));
    expect(await heading("Welcome back, Jane")).toBeInTheDocument();
    await press(user, PIN);
    expect(await heading("Hello, Jane")).toBeInTheDocument();
  });

  it("does not offer Face ID on a device without it", async () => {
    vi.stubGlobal("PublicKeyCredential", {
      isUserVerifyingPlatformAuthenticatorAvailable: () => Promise.resolve(false),
    });
    const verify = vi.spyOn(biometric, "verifyBiometric");
    open();
    expect(await heading("Welcome back, Jane")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Unlock with biometrics" })).toBeNull();
    expect(verify).not.toHaveBeenCalled();
  });
});
