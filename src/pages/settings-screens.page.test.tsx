import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as AppLockConstants from "@/constants/app-lock.constants";
import { ApiErrorKind } from "@/enums/api.enum";
import { ROUTES } from "@/routes/route-paths";
import { ApiError } from "@/services/api.error";
import { isBiometricEnabled, setPin, verifyPin } from "@/services/app-lock.service";
import * as auth from "@/services/auth.service";
import * as biometric from "@/services/biometric.service";
import { currentPreferences, loadPreferences } from "@/services/preferences.service";
import { clearUnlockedKey } from "@/services/secure-memory.service";
import { fakeSecret } from "@/test/fake-secret";
import { freshIndexedDbPerTest } from "@/test/indexed-db";
import { renderUnlocked, unlockVaultForTest } from "@/test/vault-screens";

// 600k PBKDF2 rounds per PIN would make these tests crawl.
vi.mock("@/constants/app-lock.constants", async (importOriginal) => ({
  ...(await importOriginal<typeof AppLockConstants>()),
  PBKDF2_ITERATIONS: 1000,
}));

freshIndexedDbPerTest();

const OLD_PIN = "135792";
const NEW_PIN = "864209";
const press = async (user: ReturnType<typeof userEvent.setup>, pin: string) => {
  for (const digit of pin) await user.click(await screen.findByRole("button", { name: digit }));
};

beforeEach(async () => {
  await unlockVaultForTest();
  await setPin(OLD_PIN);
});
afterEach(() => {
  clearUnlockedKey();
  vi.restoreAllMocks();
});

describe("Settings home", () => {
  it("groups the rows as designed and links each to its screen", async () => {
    renderUnlocked(ROUTES.settings);
    expect(await screen.findByText("MEMBER")).toBeInTheDocument();
    for (const [name, href] of [
      [/Change password/, ROUTES.settingsPassword],
      [/Change PIN/, ROUTES.settingsPin],
      [/^Security/, ROUTES.settingsSecurity],
      [/^Sync/, ROUTES.settingsSync],
      [/^About/, ROUTES.settingsAbout],
    ] as const) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
    expect(screen.getByText("Set by your build")).toBeInTheDocument();
    expect(screen.queryByText(/Private area/)).toBeNull();
    const rows = screen.getAllByRole("button").map((row) => row.textContent);
    expect(rows.at(-1)).toContain("Sign out");
  });
});

describe("Settings › Security", () => {
  it("shows the defaults and applies a new lock and clipboard time at once", async () => {
    renderUnlocked(ROUTES.settingsSecurity);
    const user = userEvent.setup();
    const lock = await screen.findByRole("group", { name: "LOCK THE APP AFTER" });
    expect(
      within(lock)
        .getAllByRole("button")
        .map((chip) => chip.textContent),
    ).toEqual(["Instantly", "1 min", "5 min", "15 min"]);
    expect(within(lock).getByRole("button", { name: "1 min" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(within(lock).getByRole("button", { name: "Instantly" }));
    await waitFor(() => {
      expect(currentPreferences().autoLockMs).toBe(0);
    });

    const clipboard = screen.getByRole("group", { name: "CLEAR CLIPBOARD AFTER" });
    expect(within(clipboard).getByRole("button", { name: "30 s" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(within(clipboard).getByRole("button", { name: "Never" }));
    await waitFor(async () => {
      expect(await loadPreferences()).toEqual({ autoLockMs: 0, clipboardClearMs: null });
    });
    expect(screen.queryByText(/screenshots|app switcher/i)).toBeNull();
    expect(screen.getByRole("link", { name: /Change PIN/ })).toHaveAttribute(
      "href",
      ROUTES.settingsPin,
    );
  });

  it("turns biometric unlock on by enrolling, and off again", async () => {
    vi.spyOn(biometric, "isBiometricAvailable").mockResolvedValue(true);
    const enroll = vi.spyOn(biometric, "enrollBiometric").mockResolvedValue("cred-1");
    renderUnlocked(ROUTES.settingsSecurity);
    const user = userEvent.setup();
    const toggle = await screen.findByRole("switch", { name: /Unlock with Face ID/ });
    await waitFor(() => {
      expect(toggle).not.toHaveAttribute("aria-disabled", "true");
    });
    await user.click(toggle);
    await waitFor(async () => {
      expect(await isBiometricEnabled()).toBe(true);
    });
    expect(enroll).toHaveBeenCalledOnce();
    await user.click(toggle);
    await waitFor(async () => {
      expect(await isBiometricEnabled()).toBe(false);
    });
  });

  it("stays off and says so when the device refuses to enroll", async () => {
    vi.spyOn(biometric, "isBiometricAvailable").mockResolvedValue(true);
    vi.spyOn(biometric, "enrollBiometric").mockRejectedValue(new Error("cancelled"));
    const error = vi.spyOn(toast, "error");
    renderUnlocked(ROUTES.settingsSecurity);
    const toggle = await screen.findByRole("switch", { name: /Unlock with Face ID/ });
    await waitFor(() => {
      expect(toggle).not.toHaveAttribute("aria-disabled", "true");
    });
    await userEvent.setup().click(toggle);
    await waitFor(() => {
      expect(error).toHaveBeenCalledWith(
        "Biometric unlock couldn't be set up. You can still use your PIN.",
      );
    });
    expect(await isBiometricEnabled()).toBe(false);
  });

  it("can't be turned on where the device has no biometrics", async () => {
    vi.spyOn(biometric, "isBiometricAvailable").mockResolvedValue(false);
    renderUnlocked(ROUTES.settingsSecurity);
    const toggle = await screen.findByRole("switch", { name: /Unlock with Face ID/ });
    // The switch is a custom control: it marks itself disabled for assistive tech, not with `disabled`.
    expect(toggle).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("This device can't use biometric unlock")).toBeInTheDocument();
  });
});

describe("Settings › Change PIN", () => {
  it("asks for the current PIN, then a new one twice, and saves it", async () => {
    const success = vi.spyOn(toast, "success");
    renderUnlocked(ROUTES.settingsPin);
    const user = userEvent.setup();
    expect(await screen.findByRole("heading", { name: "Current PIN" })).toBeInTheDocument();
    expect(screen.getByText("STEP 1 OF 3")).toBeInTheDocument();
    await press(user, OLD_PIN);
    expect(await screen.findByRole("heading", { name: "Set your app PIN" })).toBeInTheDocument();
    await press(user, NEW_PIN);
    expect(await screen.findByRole("heading", { name: "Confirm your PIN" })).toBeInTheDocument();
    expect(screen.getByText("STEP 3 OF 3")).toBeInTheDocument();
    await press(user, NEW_PIN);

    expect(await screen.findByRole("heading", { name: "Security" })).toBeInTheDocument();
    expect(success).toHaveBeenCalledWith("PIN changed.");
    expect(await verifyPin(NEW_PIN)).toEqual({ ok: true });
    expect((await verifyPin(OLD_PIN)).ok).toBe(false);
  });

  it("refuses a wrong current PIN and a mismatch, and keeps the old PIN", async () => {
    renderUnlocked(ROUTES.settingsPin);
    const user = userEvent.setup();
    await screen.findByRole("heading", { name: "Current PIN" });
    await press(user, "000111");
    expect(await screen.findByText(/Wrong PIN\. 4 tries left/)).toBeInTheDocument();
    await press(user, OLD_PIN);
    await screen.findByRole("heading", { name: "Set your app PIN" });
    await press(user, NEW_PIN);
    await screen.findByRole("heading", { name: "Confirm your PIN" });
    await press(user, "864200");
    expect(
      await screen.findByText("Those didn't match. Enter the same PIN again."),
    ).toBeInTheDocument();
    expect(await verifyPin(OLD_PIN)).toEqual({ ok: true });
  });

  it("locks the app on the fifth wrong current PIN", async () => {
    renderUnlocked(ROUTES.settingsPin);
    const user = userEvent.setup();
    await screen.findByRole("heading", { name: "Current PIN" });
    for (let round = 0; round < 5; round += 1) {
      await press(user, "000111");
      if (round < 4) await screen.findByText(/Wrong PIN/);
    }
    expect(await screen.findByRole("heading", { name: /Welcome back/ })).toBeInTheDocument();
  });
});

describe("Settings › Change password", () => {
  const fill = async (user: ReturnType<typeof userEvent.setup>, current: string, next: string) => {
    await user.type(await screen.findByLabelText("CURRENT PASSWORD"), current);
    await user.type(screen.getByLabelText("NEW PASSWORD"), next);
    await user.type(screen.getByLabelText("CONFIRM NEW PASSWORD"), next);
  };
  const strong = () => `${fakeSecret().slice(0, 8)}Aa1!`;

  it("is disabled until the rules pass, then saves and goes back to Settings", async () => {
    const change = vi.spyOn(auth, "changePassword").mockResolvedValue();
    const success = vi.spyOn(toast, "success");
    renderUnlocked(ROUTES.settingsPassword);
    const user = userEvent.setup();
    expect(await screen.findByText(/This is your identity on the Pi/)).toBeInTheDocument();
    const save = screen.getByRole("button", { name: "Save new password" });
    expect(save).toBeDisabled();
    const current = fakeSecret();
    const next = strong();
    await fill(user, current, next);
    expect(save).toBeEnabled();
    await user.click(save);

    expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(change.mock.calls[0]?.slice(0, 2)).toEqual([current, next]);
    expect(success).toHaveBeenCalledWith("Password changed.");
  });

  it("shows the server's reason for a wrong current password and stays on the form", async () => {
    vi.spyOn(auth, "changePassword").mockRejectedValue(
      new ApiError(ApiErrorKind.Http, "Current password is incorrect", 400),
    );
    renderUnlocked(ROUTES.settingsPassword);
    const user = userEvent.setup();
    await fill(user, "x", strong());
    await user.click(screen.getByRole("button", { name: "Save new password" }));
    expect(await screen.findByText("Current password is incorrect")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Change password" })).toBeInTheDocument();
  });
});

describe("Settings › About", () => {
  it("says what runs where, with our real stack and no dead links", async () => {
    renderUnlocked(ROUTES.settingsAbout);
    expect(await screen.findByText("AES-256-GCM")).toBeInTheDocument();
    expect(await screen.findByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Node · Express")).toBeInTheDocument();
    expect(screen.queryByText(/FastAPI|MinIO|licences/i)).toBeNull();
    expect(screen.getByText(/There is no public sign-up/)).toBeInTheDocument();
  });
});
