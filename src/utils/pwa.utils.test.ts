import { afterEach, describe, expect, it } from "vitest";
import { GateState, InstallPlatform } from "@/enums/pwa.enum";
import { setMediaQuery } from "@/test/match-media";
import { installPwaCapabilities } from "@/test/pwa-environment";
import {
  getInstallPlatform,
  isBypassPath,
  isInstalledApp,
  isPlatformSupported,
  resolveGateState,
} from "@/utils/pwa.utils";

const UA = {
  chromeDesktop:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36",
  edge: "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/141.0 Safari/537.36 Edg/141.0",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/141.0 Mobile Safari/537.36",
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 Version/19.0 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/141.0 Mobile/15E148 Safari/604.1",
  macSafari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15 Version/19.0 Safari/605.1.15",
  firefoxDesktop: "Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0",
  firefoxAndroid: "Mozilla/5.0 (Android 15; Mobile; rv:140.0) Gecko/140.0 Firefox/140.0",
};

describe("isInstalledApp", () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, "standalone");
  });

  it("is false in a plain browser tab", () => {
    expect(isInstalledApp()).toBe(false);
  });

  it.each(["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"])(
    "is true in display-mode %s",
    (mode) => {
      setMediaQuery(`(display-mode: ${mode})`, true);
      expect(isInstalledApp()).toBe(true);
    },
  );

  it("is true for an iOS home-screen launch", () => {
    Object.defineProperty(navigator, "standalone", { configurable: true, value: true });
    expect(isInstalledApp()).toBe(true);
  });

  it("is true inside a Trusted Web Activity", () => {
    const referrer = Object.getOwnPropertyDescriptor(Document.prototype, "referrer");
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "android-app://com.pivault.twa",
    });
    expect(isInstalledApp()).toBe(true);
    Reflect.deleteProperty(document, "referrer");
    expect(referrer).toBeDefined();
  });
});

describe("isPlatformSupported", () => {
  it("needs service worker and IndexedDB", () => {
    expect(isPlatformSupported()).toBe(false);
    installPwaCapabilities(true);
    expect(isPlatformSupported()).toBe(true);
  });
});

describe("getInstallPlatform", () => {
  it.each([
    [UA.chromeDesktop, 0, InstallPlatform.Chromium],
    [UA.edge, 0, InstallPlatform.Chromium],
    [UA.androidChrome, 5, InstallPlatform.Chromium],
    [UA.iphoneSafari, 5, InstallPlatform.Ios],
    [UA.iphoneChrome, 5, InstallPlatform.Ios],
    [UA.macSafari, 5, InstallPlatform.Ios],
    [UA.macSafari, 0, InstallPlatform.MacosSafari],
    [UA.firefoxAndroid, 5, InstallPlatform.FirefoxAndroid],
    [UA.firefoxDesktop, 0, InstallPlatform.Unsupported],
    ["curl/8.0", 0, InstallPlatform.Unsupported],
  ])("%s (touch %i) → %s", (ua, touch, expected) => {
    expect(getInstallPlatform(ua, touch)).toBe(expected);
  });
});

describe("gate decision", () => {
  it("only lets /reset-password through in a tab", () => {
    expect(isBypassPath("/reset-password")).toBe(true);
    expect(isBypassPath("/reset-password/")).toBe(true);
    expect(isBypassPath("/reset-passwordx")).toBe(false);
    expect(isBypassPath("/")).toBe(false);
  });

  it("resolves in priority order", () => {
    const base = { supported: true, installed: false, pathname: "/" };
    expect(resolveGateState({ ...base, supported: false, installed: true })).toBe(
      GateState.Unsupported,
    );
    expect(resolveGateState({ ...base, installed: true })).toBe(GateState.Installed);
    expect(resolveGateState({ ...base, pathname: "/reset-password" })).toBe(GateState.Bypass);
    expect(resolveGateState(base)).toBe(GateState.Install);
  });
});
