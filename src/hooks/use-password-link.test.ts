import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";
import { API_ERROR_MESSAGES } from "@/constants/api.constants";
import { INVALID_LINK_MESSAGE } from "@/constants/password-link.constants";
import { ApiErrorKind } from "@/enums/api.enum";
import { LinkPhase } from "@/enums/password-link.enum";
import { usePasswordLink } from "@/hooks/use-password-link";
import { ApiError } from "@/services/api.error";
import * as service from "@/services/password-link.service";

const TOKEN = "A".repeat(43);
const STATUS = { purpose: "onboarding", expiresAt: "2026-11-15T10:00:00.000Z" } as const;
const http = (status: number, message: string) => new ApiError(ApiErrorKind.Http, message, status);

const ready = async (token: string | null = TOKEN) => {
  vi.spyOn(service, "validateLink").mockResolvedValue(STATUS);
  const hook = renderHook(() => usePasswordLink(token));
  await waitFor(() => {
    expect(hook.result.current.phase).toBe(LinkPhase.Ready);
  });
  return hook;
};

afterEach(() => vi.restoreAllMocks());

describe("usePasswordLink: checking the link", () => {
  it("is invalid without calling the API when the token is missing or malformed", () => {
    const validate = vi.spyOn(service, "validateLink");
    expect(renderHook(() => usePasswordLink(null)).result.current.phase).toBe(LinkPhase.Invalid);
    expect(renderHook(() => usePasswordLink("short")).result.current.phase).toBe(LinkPhase.Invalid);
    expect(validate).not.toHaveBeenCalled();
  });

  it("starts checking, then is ready with the link's purpose", async () => {
    vi.spyOn(service, "validateLink").mockResolvedValue(STATUS);
    const { result } = renderHook(() => usePasswordLink(TOKEN));
    expect(result.current.phase).toBe(LinkPhase.Checking);
    await waitFor(() => {
      expect(result.current.phase).toBe(LinkPhase.Ready);
    });
    expect(result.current.purpose).toBe("onboarding");
  });

  it("is invalid when the API refuses the link", async () => {
    vi.spyOn(service, "validateLink").mockRejectedValue(http(400, INVALID_LINK_MESSAGE));
    const { result } = renderHook(() => usePasswordLink(TOKEN));
    await waitFor(() => {
      expect(result.current.phase).toBe(LinkPhase.Invalid);
    });
  });

  it("is unavailable on a network failure and can retry into ready", async () => {
    const validate = vi
      .spyOn(service, "validateLink")
      .mockRejectedValueOnce(new ApiError(ApiErrorKind.Network, API_ERROR_MESSAGES.network))
      .mockResolvedValueOnce(STATUS);
    const { result } = renderHook(() => usePasswordLink(TOKEN));
    await waitFor(() => {
      expect(result.current.phase).toBe(LinkPhase.Unavailable);
    });

    act(() => {
      result.current.retry();
    });
    expect(result.current.phase).toBe(LinkPhase.Checking);
    await waitFor(() => {
      expect(result.current.phase).toBe(LinkPhase.Ready);
    });
    expect(validate).toHaveBeenCalledTimes(2);
  });

  it("treats a server error (500) as unavailable, not invalid", async () => {
    vi.spyOn(service, "validateLink").mockRejectedValue(http(500, "Internal server error"));
    const { result } = renderHook(() => usePasswordLink(TOKEN));
    await waitFor(() => {
      expect(result.current.phase).toBe(LinkPhase.Unavailable);
    });
  });
});

describe("usePasswordLink: saving the password", () => {
  it("completes with the token and password, then succeeds", async () => {
    const complete = vi.spyOn(service, "completeLink").mockResolvedValue();
    const { result } = await ready();
    await act(() => result.current.submit("Passw0rd!"));
    expect(complete).toHaveBeenCalledWith(TOKEN, "Passw0rd!");
    expect(result.current.phase).toBe(LinkPhase.Success);
  });

  it("shows the invalid-link state when the link was spent in the meantime", async () => {
    vi.spyOn(service, "completeLink").mockRejectedValue(http(400, INVALID_LINK_MESSAGE));
    const { result } = await ready();
    await act(() => result.current.submit("Passw0rd!"));
    expect(result.current.phase).toBe(LinkPhase.Invalid);
  });

  it("keeps the form and shows the message for another 400", async () => {
    vi.spyOn(service, "completeLink").mockRejectedValue(http(400, "Password needs a digit"));
    const { result } = await ready();
    await act(() => result.current.submit("Passw0rd!"));
    expect(result.current.phase).toBe(LinkPhase.Ready);
    expect(result.current.submitError).toBe("Password needs a digit");
  });

  it("toasts a rate limit and keeps the form", async () => {
    const error = vi.spyOn(toast, "error").mockReturnValue(1);
    vi.spyOn(service, "completeLink").mockRejectedValue(http(429, "Too many requests"));
    const { result } = await ready();
    await act(() => result.current.submit("Passw0rd!"));
    expect(result.current.phase).toBe(LinkPhase.Ready);
    expect(error).toHaveBeenCalledWith("Too many attempts. Wait a minute and try again.");
  });

  it("toasts a network failure and keeps the form so the user can try again", async () => {
    const error = vi.spyOn(toast, "error").mockReturnValue(1);
    vi.spyOn(service, "completeLink").mockRejectedValue(
      new ApiError(ApiErrorKind.Network, API_ERROR_MESSAGES.network),
    );
    const { result } = await ready();
    await act(() => result.current.submit("Passw0rd!"));
    expect(result.current.phase).toBe(LinkPhase.Ready);
    expect(error).toHaveBeenCalledWith(API_ERROR_MESSAGES.network);
  });

  it("clears an earlier form error when submitting again", async () => {
    vi.spyOn(service, "completeLink")
      .mockRejectedValueOnce(http(400, "Password needs a digit"))
      .mockResolvedValueOnce();
    const { result } = await ready();
    await act(() => result.current.submit("Passw0rd!"));
    await act(() => result.current.submit("Passw0rd!"));
    expect(result.current.submitError).toBeNull();
    expect(result.current.phase).toBe(LinkPhase.Success);
  });

  it("never submits for a bad link", async () => {
    const complete = vi.spyOn(service, "completeLink").mockResolvedValue();
    const { result } = renderHook(() => usePasswordLink(null));
    await act(() => result.current.submit("Passw0rd!"));
    expect(complete).not.toHaveBeenCalled();
  });
});
