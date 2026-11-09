import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

const firePrompt = (outcome: "accepted" | "dismissed", prompt = vi.fn(() => Promise.resolve())) => {
  const event = new Event("beforeinstallprompt", { cancelable: true });
  Object.assign(event, {
    platforms: ["web"],
    prompt,
    userChoice: Promise.resolve({ outcome, platform: "web" }),
  });
  act(() => {
    window.dispatchEvent(event);
  });
  return { event, prompt };
};

describe("useInstallPrompt", () => {
  it("captures the browser prompt and suppresses the mini-infobar", () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canPrompt).toBe(false);
    const { event } = firePrompt("accepted");
    expect(event.defaultPrevented).toBe(true);
    expect(result.current.canPrompt).toBe(true);
  });

  it("marks installed when the user accepts", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const { prompt } = firePrompt("accepted");
    await act(() => result.current.promptInstall());
    expect(prompt).toHaveBeenCalledOnce();
    expect(result.current.installed).toBe(true);
    expect(result.current.canPrompt).toBe(false);
  });

  it("drops the used prompt when dismissed", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    firePrompt("dismissed");
    await act(() => result.current.promptInstall());
    expect(result.current.installed).toBe(false);
    expect(result.current.canPrompt).toBe(false);
  });

  it("toasts when the prompt throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const errorToast = vi.spyOn(toast, "error");
    const { result } = renderHook(() => useInstallPrompt());
    firePrompt(
      "accepted",
      vi.fn(() => Promise.reject(new Error("blocked"))),
    );
    await act(() => result.current.promptInstall());
    expect(errorToast).toHaveBeenCalledOnce();
  });

  it("reacts to appinstalled", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    await waitFor(() => {
      expect(result.current.installed).toBe(true);
    });
  });
});
