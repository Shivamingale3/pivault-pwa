import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTO_LOCK_AFTER_MS } from "@/constants/lock.constants";
import { AuthStatus } from "@/enums/auth.enum";
import { useAuth } from "@/hooks/use-auth";
import { useAutoLock } from "@/hooks/use-auto-lock";
import { AuthProvider } from "@/providers/auth.provider";

const setVisibility = (state: "hidden" | "visible") => {
  Object.defineProperty(document, "visibilityState", { configurable: true, value: state });
  document.dispatchEvent(new Event("visibilitychange"));
};

function Probe() {
  useAutoLock();
  return <p>{useAuth().status}</p>;
}

const renderProbe = () =>
  render(
    <AuthProvider initialStatus={AuthStatus.Unlocked}>
      <Probe />
    </AuthProvider>,
  );

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});
afterEach(() => {
  setVisibility("visible");
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useAutoLock", () => {
  it("locks after the app stays in the background long enough", () => {
    const view = renderProbe();
    act(() => {
      setVisibility("hidden");
    });
    act(() => {
      vi.advanceTimersByTime(AUTO_LOCK_AFTER_MS);
    });
    expect(view.getByText(AuthStatus.Locked)).toBeInTheDocument();
  });

  it("stays unlocked after a short trip away", () => {
    const view = renderProbe();
    act(() => {
      setVisibility("hidden");
      vi.advanceTimersByTime(AUTO_LOCK_AFTER_MS - 1);
      setVisibility("visible");
    });
    act(() => {
      vi.advanceTimersByTime(AUTO_LOCK_AFTER_MS * 2);
    });
    expect(view.getByText(AuthStatus.Unlocked)).toBeInTheDocument();
  });

  it("locks on return when the browser throttled the timer", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const view = renderProbe();
    act(() => {
      setVisibility("hidden");
    });
    now.mockReturnValue(1_000_000 + AUTO_LOCK_AFTER_MS + 5);
    act(() => {
      setVisibility("visible");
    });
    expect(view.getByText(AuthStatus.Locked)).toBeInTheDocument();
  });
});
