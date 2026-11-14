import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import { API_ERROR_MESSAGES } from "@/constants/api.constants";
import { INVALID_LINK_MESSAGE } from "@/constants/password-link.constants";
import { PWA_BYPASS_PATHS } from "@/constants/pwa.constants";
import { ApiErrorKind } from "@/enums/api.enum";
import { ROUTES } from "@/routes/route-paths";
import { ApiError } from "@/services/api.error";
import * as service from "@/services/password-link.service";
import { installPwaCapabilities } from "@/test/pwa-environment";

const TOKEN = "A".repeat(43);
const STATUS = { purpose: "onboarding", expiresAt: "2026-11-15T10:00:00.000Z" } as const;
const PASSWORD = "Passw0rd!";

const openLink = (search = `?key=${TOKEN}`) => {
  window.history.pushState(null, "", `${ROUTES.resetPassword}${search}`);
  return render(<App />);
};

const fill = async (password = PASSWORD, confirm = PASSWORD) => {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText("New password"), password);
  await user.type(screen.getByLabelText("Confirm password"), confirm);
  return user;
};

beforeEach(() => {
  // A plain browser tab (not installed) that supports the app: the page must still open.
  installPwaCapabilities(true);
});

describe("/reset-password (integration)", () => {
  it("is allowed past the install gate", () => {
    expect(PWA_BYPASS_PATHS).toContain(ROUTES.resetPassword);
  });

  it("opens in a browser tab, hides the token from the URL and shows the form", async () => {
    vi.spyOn(service, "validateLink").mockResolvedValue(STATUS);
    openLink();
    expect(await screen.findByRole("heading", { name: "Set a new password" })).toBeInTheDocument();
    expect(window.location.search).toBe("");
    expect(window.location.href).not.toContain(TOKEN);
    expect(service.validateLink).toHaveBeenCalledWith(TOKEN, expect.any(AbortSignal));
  });

  it("explains the link also confirms the email (onboarding)", async () => {
    vi.spyOn(service, "validateLink").mockResolvedValue(STATUS);
    openLink();
    expect(await screen.findByText(/also confirms your email address/)).toBeInTheDocument();
  });

  it("shows a loading state while the link is checked", () => {
    vi.spyOn(service, "validateLink").mockReturnValue(new Promise(() => undefined));
    openLink();
    expect(screen.getByRole("status", { name: "Checking your link" })).toBeInTheDocument();
  });

  it("shows the invalid state without calling the API when there is no key", () => {
    const validate = vi.spyOn(service, "validateLink");
    openLink("");
    expect(screen.getByRole("heading", { name: INVALID_LINK_MESSAGE })).toBeInTheDocument();
    expect(validate).not.toHaveBeenCalled();
  });

  it("shows the invalid state when the API refuses the link", async () => {
    vi.spyOn(service, "validateLink").mockRejectedValue(
      new ApiError(ApiErrorKind.Http, INVALID_LINK_MESSAGE, 400),
    );
    openLink();
    expect(await screen.findByRole("heading", { name: INVALID_LINK_MESSAGE })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to PiVault" })).toHaveAttribute("href", "/");
  });

  it("offers a retry when the link cannot be checked", async () => {
    const validate = vi
      .spyOn(service, "validateLink")
      .mockRejectedValueOnce(new ApiError(ApiErrorKind.Network, API_ERROR_MESSAGES.network))
      .mockResolvedValueOnce(STATUS);
    openLink();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { name: "Set a new password" })).toBeInTheDocument();
    expect(validate).toHaveBeenCalledTimes(2);
  });

  it("keeps Save disabled until every rule passes, then enables it", async () => {
    vi.spyOn(service, "validateLink").mockResolvedValue(STATUS);
    openLink();
    const user = await fill("weak", "weak");
    const save = screen.getByRole("button", { name: "Save password" });
    expect(save).toBeDisabled();

    await user.clear(screen.getByLabelText("New password"));
    await user.clear(screen.getByLabelText("Confirm password"));
    await user.type(screen.getByLabelText("New password"), PASSWORD);
    await user.type(screen.getByLabelText("Confirm password"), PASSWORD);
    expect(save).toBeEnabled();
  });

  it("marks a mismatching confirmation invalid", async () => {
    vi.spyOn(service, "validateLink").mockResolvedValue(STATUS);
    openLink();
    await fill(PASSWORD, "Passw0rd?");
    expect(screen.getByLabelText("Confirm password")).toBeInvalid();
    expect(screen.getByRole("button", { name: "Save password" })).toBeDisabled();
  });

  it("toggles password visibility", async () => {
    vi.spyOn(service, "validateLink").mockResolvedValue(STATUS);
    openLink();
    const user = userEvent.setup();
    const field = await screen.findByLabelText("New password");
    expect(field).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show new password" }));
    expect(field).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Hide new password" }));
    expect(field).toHaveAttribute("type", "password");
  });

  it("saves the password and confirms the email", async () => {
    vi.spyOn(service, "validateLink").mockResolvedValue(STATUS);
    const complete = vi.spyOn(service, "completeLink").mockResolvedValue();
    openLink();
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Save password" }));

    expect(await screen.findByRole("heading", { name: "Password saved" })).toBeInTheDocument();
    expect(complete).toHaveBeenCalledWith(TOKEN, PASSWORD);
    expect(screen.getByText(/Your email is verified/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open PiVault" })).toHaveAttribute("href", "/");
  });

  it("submits with Enter", async () => {
    vi.spyOn(service, "validateLink").mockResolvedValue(STATUS);
    const complete = vi.spyOn(service, "completeLink").mockResolvedValue();
    openLink();
    const user = await fill();
    await user.type(screen.getByLabelText("Confirm password"), "{Enter}");
    await waitFor(() => {
      expect(complete).toHaveBeenCalledTimes(1);
    });
  });

  it("toasts a network failure and keeps what the user typed", async () => {
    vi.spyOn(service, "validateLink").mockResolvedValue(STATUS);
    vi.spyOn(service, "completeLink").mockRejectedValue(
      new ApiError(ApiErrorKind.Network, API_ERROR_MESSAGES.network),
    );
    const error = vi.spyOn(toast, "error").mockReturnValue(1);
    openLink();
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Save password" }));

    await waitFor(() => {
      expect(error).toHaveBeenCalledWith(API_ERROR_MESSAGES.network);
    });
    expect(screen.getByLabelText("New password")).toHaveValue(PASSWORD);
    expect(screen.getByRole("button", { name: "Save password" })).toBeEnabled();
  });

  it("shows the invalid state if the link was used in the meantime", async () => {
    vi.spyOn(service, "validateLink").mockResolvedValue(STATUS);
    vi.spyOn(service, "completeLink").mockRejectedValue(
      new ApiError(ApiErrorKind.Http, INVALID_LINK_MESSAGE, 400),
    );
    openLink();
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Save password" }));
    expect(await screen.findByRole("heading", { name: INVALID_LINK_MESSAGE })).toBeInTheDocument();
  });

  it("shows another 400 inline, in the form", async () => {
    vi.spyOn(service, "validateLink").mockResolvedValue(STATUS);
    vi.spyOn(service, "completeLink").mockRejectedValue(
      new ApiError(ApiErrorKind.Http, "Password needs a digit", 400),
    );
    openLink();
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Save password" }));
    expect(await screen.findByText("Password needs a digit")).toBeInTheDocument();
  });

  it("uses the reset wording for a forgot-password link", async () => {
    vi.spyOn(service, "validateLink").mockResolvedValue({ ...STATUS, purpose: "reset" });
    openLink();
    expect(await screen.findByText(/encryption is not affected/)).toBeInTheDocument();
  });
});
