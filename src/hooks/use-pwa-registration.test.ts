import { renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SW_UPDATE_INTERVAL_MS } from "@/constants/pwa.constants";
import { checkForUpdate, usePwaRegistration } from "@/hooks/use-pwa-registration";
import { registerCalls } from "@/test/stubs/pwa-register";

const latestOptions = () => {
  const options = registerCalls.at(-1);
  if (!options) throw new Error("useRegisterSW was not called");
  return options;
};

const fakeRegistration = (installing: unknown = null) => {
  const update = vi.fn(() => Promise.resolve());
  const registration = { installing, update } as unknown as ServiceWorkerRegistration;
  return { registration, update };
};

const setOnline = (online: boolean) => {
  Object.defineProperty(navigator, "onLine", { configurable: true, value: online });
};

describe("usePwaRegistration", () => {
  afterEach(() => {
    vi.useRealTimers();
    setOnline(true);
  });

  it("toasts once offline use is ready", () => {
    const success = vi.spyOn(toast, "success");
    renderHook(() => {
      usePwaRegistration();
    });
    latestOptions().onOfflineReady?.();
    expect(success).toHaveBeenCalledWith("Ready to work offline", expect.any(Object));
  });

  it("logs and toasts registration errors", () => {
    const error = vi.spyOn(toast, "error");
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderHook(() => {
      usePwaRegistration();
    });
    latestOptions().onRegisterError?.(new Error("no sw"));
    expect(error).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalled();
  });

  it("checks for updates hourly and stops on unmount", () => {
    vi.useFakeTimers();
    const { registration, update } = fakeRegistration();
    const { unmount } = renderHook(() => {
      usePwaRegistration();
    });
    latestOptions().onRegisteredSW?.("/sw.js", registration);

    vi.advanceTimersByTime(SW_UPDATE_INTERVAL_MS);
    expect(update).toHaveBeenCalledTimes(1);

    unmount();
    vi.advanceTimersByTime(SW_UPDATE_INTERVAL_MS * 2);
    expect(update).toHaveBeenCalledTimes(1);
  });
});

describe("checkForUpdate", () => {
  it("skips when offline or already installing", async () => {
    setOnline(false);
    const offline = fakeRegistration();
    await checkForUpdate(offline.registration);
    expect(offline.update).not.toHaveBeenCalled();

    setOnline(true);
    const busy = fakeRegistration({});
    await checkForUpdate(busy.registration);
    expect(busy.update).not.toHaveBeenCalled();
  });

  it("swallows a failed check", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { registration, update } = fakeRegistration();
    update.mockRejectedValueOnce(new Error("offline"));
    await expect(checkForUpdate(registration)).resolves.toBeUndefined();
  });
});
