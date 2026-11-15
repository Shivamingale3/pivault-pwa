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

const open = (path: string = ROUTES.home) => {
  window.history.pushState(null, "", path);
  return render(<App />);
};

const heading = (name: string) => screen.findByRole("heading", { name });

beforeEach(() => {
  runAsInstalledApp();
});

describe("starting the app", () => {
  it("shows login when no one is signed in, whatever the address", async () => {
    open("/anywhere");
    expect(await heading("Welcome back")).toBeInTheDocument();
    expect(window.location.pathname).toBe(ROUTES.login);
  });

  it("resumes at setup for a signed in user who has not finished it", async () => {
    await saveSession(SESSION);
    open(ROUTES.login);
    expect(await heading("Set up app lock")).toBeInTheDocument();
  });

  it("resumes at the lock screen once setup is done", async () => {
    await saveSession({ ...SESSION, setupDone: true });
    open();
    expect(await heading("PiVault is locked")).toBeInTheDocument();
  });

  it("falls back to login and says so when the saved session is unreadable", async () => {
    const error = vi.spyOn(toast, "error");
    await idbPut(StoreName.Auth, RecordId.Session, { nonsense: true });
    open();
    expect(await heading("Welcome back")).toBeInTheDocument();
    expect(error).toHaveBeenCalledOnce();
  });
});

describe("login screen", () => {
  const fill = async (email = "jane@example.com", password = "Passw0rd!") => {
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Password"), password);
    return user;
  };

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

  it("signs in and moves on to setup, leaving login behind", async () => {
    const login = vi.spyOn(service, "login").mockResolvedValue(SESSION);
    open(ROUTES.login);
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await heading("Set up app lock")).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith("jane@example.com", "Passw0rd!", expect.any(AbortSignal));
    expect(window.location.pathname).toBe(ROUTES.setupAppLock);
  });

  it("shows the server's reason inline, without a toast, and lets the user retry", async () => {
    const error = vi.spyOn(toast, "error");
    vi.spyOn(service, "login")
      .mockRejectedValueOnce(new ApiError(ApiErrorKind.Http, "Invalid email or password", 401))
      .mockResolvedValueOnce(SESSION);
    open(ROUTES.login);
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(error).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await heading("Set up app lock")).toBeInTheDocument();
  });

  it("toasts when the server can't be reached, and stays on login", async () => {
    const error = vi.spyOn(toast, "error");
    vi.spyOn(service, "login").mockRejectedValue(new ApiError(ApiErrorKind.Network, "Offline"));
    open(ROUTES.login);
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(error).toHaveBeenCalledWith("Offline");
    });
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
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

  it("links to forgot password", async () => {
    open(ROUTES.login);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("link", { name: "Forgot password?" }));
    expect(await heading("Forgot password")).toBeInTheDocument();
  });
});

describe("forgot password screen", () => {
  it("sends the link and confirms where it went", async () => {
    const request = vi.spyOn(service, "requestPasswordReset").mockResolvedValue(undefined);
    open(ROUTES.forgotPassword);
    const user = userEvent.setup();
    const button = await screen.findByRole("button", { name: "Send reset link" });
    expect(button).toBeDisabled();
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
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
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Email"), "ghost@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByText("No account found for that email")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Forgot password" })).toBeInTheDocument();
  });

  it("is not reachable once signed in", async () => {
    await saveSession({ ...SESSION, setupDone: true });
    open(ROUTES.forgotPassword);
    expect(await heading("PiVault is locked")).toBeInTheDocument();
  });
});
