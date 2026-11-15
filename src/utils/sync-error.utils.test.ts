import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiErrorKind } from "@/enums/api.enum";
import { ApiError } from "@/services/api.error";
import { isOfflineError, isSessionEnded } from "@/utils/sync-error.utils";

afterEach(() => vi.restoreAllMocks());

describe("sync error classification", () => {
  it("treats network failures and timeouts as offline", () => {
    expect(isOfflineError(new ApiError(ApiErrorKind.Network, "x"))).toBe(true);
    expect(isOfflineError(new ApiError(ApiErrorKind.Timeout, "x"))).toBe(true);
  });

  it("treats anything as offline when the browser says there is no connection", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    expect(isOfflineError(new Error("whatever"))).toBe(true);
  });

  it("does not call a server answer offline", () => {
    expect(isOfflineError(new ApiError(ApiErrorKind.Http, "x", 500))).toBe(false);
    expect(isOfflineError(new TypeError("boom"))).toBe(false);
  });

  it("recognises a session the server no longer knows", () => {
    expect(isSessionEnded(new ApiError(ApiErrorKind.Http, "Not signed in", 401))).toBe(true);
    expect(isSessionEnded(new ApiError(ApiErrorKind.Http, "x", 500))).toBe(false);
    expect(isSessionEnded(new ApiError(ApiErrorKind.Network, "x"))).toBe(false);
    expect(isSessionEnded(new Error("x"))).toBe(false);
  });
});
