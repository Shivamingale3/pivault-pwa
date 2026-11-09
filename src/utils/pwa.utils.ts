import {
  displayModeQuery,
  INSTALLED_DISPLAY_MODES,
  PWA_BYPASS_PATHS,
  TWA_REFERRER_PREFIX,
} from "@/constants/pwa.constants";
import { GateState, InstallPlatform } from "@/enums/pwa.enum";
import type { NavigatorWithStandalone } from "@/interfaces/pwa.interface";

const matches = (query: string): boolean =>
  typeof window.matchMedia === "function" && window.matchMedia(query).matches;

/** True when running as an installed app (any platform), false in a browser tab. */
export const isInstalledApp = (): boolean => {
  if (INSTALLED_DISPLAY_MODES.some((mode) => matches(displayModeQuery(mode)))) return true;
  if ((navigator as NavigatorWithStandalone).standalone === true) return true;
  return document.referrer.startsWith(TWA_REFERRER_PREFIX);
};

/** Offline-first storage and on-device encryption both need these; without them PiVault can't run. */
export const isPlatformSupported = (): boolean =>
  // jsdom and very old browsers don't define it; treat that as not secure.
  "isSecureContext" in window &&
  window.isSecureContext &&
  "serviceWorker" in navigator &&
  "indexedDB" in window &&
  "crypto" in globalThis &&
  "subtle" in globalThis.crypto;

export const isBypassPath = (pathname: string): boolean =>
  PWA_BYPASS_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

/** Best-effort browser detection, used only to pick install instructions. */
export const getInstallPlatform = (userAgent: string, maxTouchPoints = 0): InstallPlatform => {
  const ua = userAgent.toLowerCase();
  const isIpadOs = ua.includes("macintosh") && maxTouchPoints > 1;
  if (/iphone|ipad|ipod/.test(ua) || isIpadOs) return InstallPlatform.Ios;
  if (ua.includes("firefox")) {
    return ua.includes("android") ? InstallPlatform.FirefoxAndroid : InstallPlatform.Unsupported;
  }
  if (/chrome|chromium|crios|edg\/|samsungbrowser|opr\//.test(ua)) return InstallPlatform.Chromium;
  if (ua.includes("android")) return InstallPlatform.Chromium;
  if (ua.includes("safari") && ua.includes("macintosh")) return InstallPlatform.MacosSafari;
  return InstallPlatform.Unsupported;
};

interface GateInput {
  supported: boolean;
  installed: boolean;
  pathname: string;
}

/** Order matters: an unsupported browser can't run even the bypass pages safely. */
export const resolveGateState = ({ supported, installed, pathname }: GateInput): GateState => {
  if (!supported) return GateState.Unsupported;
  if (installed) return GateState.Installed;
  if (isBypassPath(pathname)) return GateState.Bypass;
  return GateState.Install;
};
