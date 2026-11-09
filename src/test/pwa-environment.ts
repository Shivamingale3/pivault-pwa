import { setStandalone } from "@/test/match-media";

/** jsdom lacks secure-context, service workers and IndexedDB; fake the capabilities the install gate checks. */
export const installPwaCapabilities = (supported = true) => {
  if (supported) {
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: {} });
    Object.defineProperty(window, "indexedDB", { configurable: true, value: {} });
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
  } else {
    Reflect.deleteProperty(window, "isSecureContext");
    Reflect.deleteProperty(navigator, "serviceWorker");
    Reflect.deleteProperty(window, "indexedDB");
  }
};

/** Puts the test in "installed app" mode so the vault UI renders past the gate. */
export const runAsInstalledApp = () => {
  installPwaCapabilities(true);
  setStandalone(true);
};
