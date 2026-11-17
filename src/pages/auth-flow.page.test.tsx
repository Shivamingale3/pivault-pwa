import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbPut } from "@/db/idb";
import { ApiErrorKind } from "@/enums/api.enum";
import { ROUTES } from "@/routes/route-paths";
import type { SessionRecord } from "@/schemas/session.schema";
import { ApiError } from "@/services/api.error";
import * as service from "@/services/auth.service";
import { saveSession } from "@/services/session.service";
import { runAsInstalledApp } from "@/test/pwa-environment";
import { fakeSecret } from "@/test/fake-secret";

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

beforeEach(() => {
  runAsInstalledApp();
});

describe("starting the app", () => {
  it("shows sign in when no one is signed in, whatever the address", async () => {
    open("/anywhere");
    expect(await heading("Sign in")).toBeInTheDocument();
    expect(window.location.pathname).toBe(ROUTES.login);
  });

  it("resumes at setup for a signed in user who has not finished it", async () => {
    await saveSession(SESSION);
    open(ROUTES.login);
    expect(await heading("Set your app PIN")).toBeInTheDocument();
  });

  it("resumes at the lock screen once setup is done", async () => {
    await saveSession({ ...SESSION, setupDone: true });
    open();
    expect(await heading("Welcome back, Jane")).toBeInTheDocument();
  });

  it("falls back to sign in and says so when the saved session is unreadable", async () => {
    const error = vi.spyOn(toast, "error");
    await idbPut(StoreName.Auth, RecordId.Session, { nonsense: true });
    open();
    expect(await heading("Sign in")).toBeInTheDocument();
    expect(error).toHaveBeenCalledOnce();
  });
});

describe("sign in screen", () => {
  const PASSWORD = fakeSecret();
  const fill = async (email = "jane@example.com", password = PASSWORD) => {
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Password"), password);
    return user;
  };

  it("shows the brand card, the title, the body and the forgot link", async () => {
    open(ROUTES.login);
    expect(await heading("PiVault")).toBeInTheDocument();
    expect(screen.getByText("Self-hosted on your Pi")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByText(/Sign in to open your passwords and notes/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute(
      "href",
      ROUTES.forgotPassword,
    );
  });

  it("keeps Sign in disabled until the email and password are filled", async () => {
    open(ROUTES.login);
    const user = userEvent.setup();
    const button = await screen.findByRole("button", { name: "Sign in" });
    expect(button).toBeDisabled();
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "x");
    expect(button).toBeDisabled();
    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    expect(button).toBeEnabled();
  });

  it("checks the email on blur only, and ticks a good one", async () => {
    open(ROUTES.login);
    const user = userEvent.setup();
    const email = await screen.findByLabelText("Email");
    await user.type(email, "jane@");
    expect(email).not.toHaveAttribute("aria-invalid", "true");
    await user.tab();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("img", { name: "Looks good" })).toBeNull();
    await user.type(email, "example.com");
    expect(screen.getByRole("img", { name: "Looks good" })).toBeInTheDocument();
  });

  it("hints when caps lock is on", async () => {
    open(ROUTES.login);
    const user = userEvent.setup();
    await user.click(await screen.findByLabelText("Password"));
    await user.keyboard("{CapsLock>}a{/CapsLock}");
    expect(await screen.findByText("Caps lock is on")).toBeInTheDocument();
  });

  it("shows Signed in, then moves on to setup, leaving sign in behind", async () => {
    const login = vi.spyOn(service, "login").mockResolvedValue(SESSION);
    open(ROUTES.login);
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Signed in")).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith("jane@example.com", PASSWORD, expect.any(AbortSignal));
    expect(await heading("Set your app PIN", 4000)).toBeInTheDocument();
    expect(window.location.pathname).toBe(ROUTES.setupAppLock);
  });

  it("shows the server's reason inline, without a toast, clears it on typing, and lets the user retry", async () => {
    const error = vi.spyOn(toast, "error");
    vi.spyOn(service, "login")
      .mockRejectedValueOnce(new ApiError(ApiErrorKind.Http, "Invalid email or password", 401))
      .mockResolvedValueOnce(SESSION);
    open(ROUTES.login);
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(error).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("Password"), "!");
    expect(screen.queryByText("Invalid email or password")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await heading("Set your app PIN", 4000)).toBeInTheDocument();
  });

  it("toasts when the server can't be reached, and stays on sign in", async () => {
    const error = vi.spyOn(toast, "error");
    vi.spyOn(service, "login").mockRejectedValue(new ApiError(ApiErrorKind.Network, "Offline"));
    open(ROUTES.login);
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => {
      expect(error).toHaveBeenCalledWith("Offline");
    });
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });

  it("toasts a failure that has no message of its own with a generic one", async () => {
    const error = vi.spyOn(toast, "error");
    vi.spyOn(service, "login").mockRejectedValue(new TypeError("boom"));
    open(ROUTES.login);
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => {
      expect(error).toHaveBeenCalledWith("Something went wrong. Try again.");
    });
  });

  it("links to the reset screen", async () => {
    open(ROUTES.login);
    await userEvent.setup().click(await screen.findByRole("link", { name: "Forgot password?" }));
    expect(await heading("Reset password")).toBeInTheDocument();
  });
});

describe("sign in paused", () => {
  const lockout = (retryAfterSeconds: number) =>
    new ApiError(
      ApiErrorKind.Http,
      "Too many failed sign-in attempts. Try again later.",
      429,
      undefined,
      {
        retryAfterSeconds,
        attempt: 5,
        attemptsPerRound: 5,
        nextWaitSeconds: 300,
      },
    );
  const trySignIn = async () => {
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), fakeSecret());
    await user.click(screen.getByRole("button", { name: "Sign in" }));
  };

  it("replaces the form with the live wait, the disabled fields and the way out", async () => {
    const error = vi.spyOn(toast, "error");
    vi.spyOn(service, "login").mockRejectedValue(lockout(30));
    open(ROUTES.login);
    await trySignIn();

    expect(await heading("Sign-in paused")).toBeInTheDocument();
    expect(screen.getByText(/Five wrong passwords in a row/)).toBeInTheDocument();
    const wait = screen.getByRole("status", { name: /TRY AGAIN IN 0:/ });
    expect(wait).toHaveTextContent("Attempt 5 of 5 · next wait 5 min");
    expect(wait).toHaveAttribute("aria-live", "off");
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Email")).toHaveValue("jane@example.com");
    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Reset password instead" })).toHaveAttribute(
      "href",
      ROUTES.forgotPassword,
    );
    expect(error).not.toHaveBeenCalled();
  });

  it("gives the form back when the wait runs out", async () => {
    vi.spyOn(service, "login").mockRejectedValue(lockout(1));
    open(ROUTES.login);
    await trySignIn();
    expect(await heading("Sign-in paused")).toBeInTheDocument();
    expect(await heading("Sign in", 4000)).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeEnabled();
  });
});

describe("reset password screen", () => {
  const fillEmail = async () => {
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Account email"), "jane@example.com");
    return user;
  };

  it("explains itself, has a back button and the reassurance", async () => {
    open(ROUTES.forgotPassword);
    expect(await heading("Reset password")).toBeInTheDocument();
    expect(screen.getByText(/We'll email you a link to reset it/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", ROUTES.login);
    expect(screen.getByText(/Resetting your password doesn't touch them/)).toBeInTheDocument();
  });

  it("sends the link and confirms where it went", async () => {
    const request = vi.spyOn(service, "requestPasswordReset").mockResolvedValue(undefined);
    open(ROUTES.forgotPassword);
    const user = userEvent.setup();
    const button = await screen.findByRole("button", { name: "Send link" });
    expect(button).toBeDisabled();
    await fillEmail();
    await user.click(button);

    expect(await heading("Check your email")).toBeInTheDocument();
    expect(screen.getByText(/jane@example\.com/)).toBeInTheDocument();
    expect(screen.getByText(/15 minutes/)).toBeInTheDocument();
    expect(request).toHaveBeenCalledWith("jane@example.com", expect.any(AbortSignal));
    expect(screen.getByRole("link", { name: "Back to login" })).toHaveAttribute(
      "href",
      ROUTES.login,
    );
  });

  it("tells the user when there is no account for the email", async () => {
    vi.spyOn(service, "requestPasswordReset").mockRejectedValue(
      new ApiError(ApiErrorKind.Http, "No account found for that email", 404),
    );
    open(ROUTES.forgotPassword);
    const user = await fillEmail();
    await user.click(screen.getByRole("button", { name: "Send link" }));
    expect(await screen.findByText("No account found for that email")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reset password" })).toBeInTheDocument();
  });

  it("is not reachable once signed in", async () => {
    await saveSession({ ...SESSION, setupDone: true });
    open(ROUTES.forgotPassword);
    expect(await heading("Welcome back, Jane")).toBeInTheDocument();
  });
});
