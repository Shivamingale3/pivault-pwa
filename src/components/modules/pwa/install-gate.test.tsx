import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InstallGate } from "@/components/modules/pwa/install-gate";
import { setStandalone } from "@/test/match-media";
import { installPwaCapabilities, runAsInstalledApp } from "@/test/pwa-environment";

const renderGate = () =>
  render(
    <InstallGate>
      <p>Vault</p>
    </InstallGate>,
  );

const setUserAgent = (ua: string) => {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(ua);
};

const CHROME_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";

describe("InstallGate (integration)", () => {
  it("blocks the app in a browser tab", () => {
    installPwaCapabilities(true);
    setUserAgent(CHROME_UA);
    renderGate();
    expect(screen.getByRole("heading", { name: "Install PiVault" })).toBeInTheDocument();
    expect(screen.queryByText("Vault")).not.toBeInTheDocument();
  });

  it("renders the app when installed", () => {
    runAsInstalledApp();
    renderGate();
    expect(screen.getByText("Vault")).toBeInTheDocument();
  });

  it("opens live when the tab becomes the app window", () => {
    installPwaCapabilities(true);
    renderGate();
    expect(screen.queryByText("Vault")).not.toBeInTheDocument();
    act(() => {
      setStandalone(true);
    });
    expect(screen.getByText("Vault")).toBeInTheDocument();
  });

  it("lets the reset-password page run in a tab", () => {
    installPwaCapabilities(true);
    window.history.replaceState(null, "", "/reset-password?key=abc");
    renderGate();
    expect(screen.getByText("Vault")).toBeInTheDocument();
  });

  it("refuses browsers without service workers or IndexedDB", () => {
    renderGate();
    expect(screen.getByRole("heading", { name: "This browser can't run PiVault" })).toBeVisible();
  });

  it("shows Add to Home Screen steps on iOS", () => {
    installPwaCapabilities(true);
    setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 Version/19.0 Mobile/15E148 Safari/604.1",
    );
    renderGate();
    expect(screen.getByText("Tap “Add to Home Screen”")).toBeInTheDocument();
  });

  it("sends desktop Firefox to a supported browser", () => {
    installPwaCapabilities(true);
    setUserAgent("Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0");
    renderGate();
    expect(screen.getByRole("heading", { name: "Open PiVault in another browser" })).toBeVisible();
  });

  it("offers a one-tap install when the browser allows it", async () => {
    installPwaCapabilities(true);
    setUserAgent(CHROME_UA);
    renderGate();
    const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
      platforms: ["web"],
      prompt: vi.fn(() => Promise.resolve()),
      userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
    });
    act(() => {
      window.dispatchEvent(event);
    });
    await userEvent.click(screen.getByRole("button", { name: "Install app" }));
    expect(event.prompt).toHaveBeenCalledOnce();
    expect(await screen.findByRole("heading", { name: "PiVault is installed" })).toBeVisible();
  });
});
