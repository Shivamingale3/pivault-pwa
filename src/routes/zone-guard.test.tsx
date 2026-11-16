import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as AppLockConstants from "@/constants/app-lock.constants";

vi.mock("@/constants/app-lock.constants", async (importOriginal) => ({
  ...(await importOriginal<typeof AppLockConstants>()),
  PBKDF2_ITERATIONS: 1000,
}));
import { AuthStatus } from "@/enums/auth.enum";
import { AuthProvider } from "@/providers/auth.provider";
import { AppRoutes } from "@/routes/app.routes";
import { ROUTES } from "@/routes/route-paths";
import { setPin } from "@/services/app-lock.service";
import { generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { saveVaultKey } from "@/services/key-store.service";
import { saveSession } from "@/services/session.service";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

freshIndexedDbPerTest();

// The recovery key screen reads the saved account, so every test starts signed in on this device.
beforeEach(async () => {
  await saveSession({
    userId: "01JABC",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Doe",
    token: "t".repeat(43),
    expiresAt: "2026-12-15T10:00:00.000Z",
    recoveryKeyConfigured: false,
    setupDone: false,
  });
});

const SCREEN_TITLES = {
  [ROUTES.login]: "Sign in",
  [ROUTES.forgotPassword]: "Reset password",
  [ROUTES.setupAppLock]: "Set your app PIN",
  [ROUTES.setupRecoveryKey]: "Your recovery key",
  [ROUTES.lock]: "Welcome back, Jane",
  [ROUTES.home]: "Hello, Jane",
} as const;

type GuardedPath = keyof typeof SCREEN_TITLES;

const ALLOWED: Record<AuthStatus, readonly GuardedPath[]> = {
  [AuthStatus.LoggedOut]: [ROUTES.login, ROUTES.forgotPassword],
  [AuthStatus.NeedsSetup]: [ROUTES.setupAppLock, ROUTES.setupRecoveryKey],
  [AuthStatus.Locked]: [ROUTES.lock],
  [AuthStatus.Unlocked]: [ROUTES.home],
};

const DEFAULT_SCREEN: Record<AuthStatus, GuardedPath> = {
  [AuthStatus.LoggedOut]: ROUTES.login,
  [AuthStatus.NeedsSetup]: ROUTES.setupAppLock,
  [AuthStatus.Locked]: ROUTES.lock,
  [AuthStatus.Unlocked]: ROUTES.home,
};

const renderAt = (status: AuthStatus, path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider initialStatus={status}>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  );

const heading = (path: GuardedPath) => screen.findByRole("heading", { name: SCREEN_TITLES[path] });

describe("route zones", () => {
  for (const status of Object.values(AuthStatus)) {
    for (const path of Object.keys(SCREEN_TITLES) as GuardedPath[]) {
      const allowed = ALLOWED[status].includes(path);
      it(`${status} ${allowed ? "can open" : "is redirected away from"} ${path}`, async () => {
        renderAt(status, path);
        expect(await heading(allowed ? path : DEFAULT_SCREEN[status])).toBeInTheDocument();
      });
    }

    it(`${status} lands on its own screen for an unknown path`, async () => {
      renderAt(status, "/nope");
      expect(await heading(DEFAULT_SCREEN[status])).toBeInTheDocument();
    });

    it(`${status} can always open the emailed reset-password link`, () => {
      renderAt(status, ROUTES.resetPassword);
      expect(
        screen.queryByRole("heading", { name: SCREEN_TITLES[DEFAULT_SCREEN[status]] }),
      ).toBeNull();
    });
  }
});

describe("auth journey", () => {
  const press = async (user: ReturnType<typeof userEvent.setup>, pin: string) => {
    for (const digit of pin) await user.click(await screen.findByRole("button", { name: digit }));
  };

  it("walks unlock -> vault -> lock -> unlock -> settings -> sign out", async () => {
    await setPin("135792");
    await saveVaultKey(await importRecoveryKey(generateRecoveryKey()));
    const user = userEvent.setup();
    renderAt(AuthStatus.Locked, ROUTES.lock);

    await heading(ROUTES.lock);
    await press(user, "135792");
    expect(await heading(ROUTES.home)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Settings" }));
    await user.click(await screen.findByRole("button", { name: /Lock now/ }));
    expect(await heading(ROUTES.lock)).toBeInTheDocument();

    await press(user, "135792");
    expect(await heading(ROUTES.home)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Settings" }));
    await user.click(await screen.findByRole("button", { name: "Sign out" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Sign out" }),
    );
    expect(await heading(ROUTES.login)).toBeInTheDocument();
  });
});
