import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { setStandalone } from "@/test/match-media";

/** jsdom lacks secure-context, service workers and IndexedDB; fake the capabilities the install gate checks
 * (IndexedDB is a real in-memory one, fresh on every call, so the auth session can be stored). */
export const installPwaCapabilities = (supported = true) => {
  if (supported) {
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: {} });
    Object.defineProperty(window, "indexedDB", { configurable: true, value: new IDBFactory() });
    Object.defineProperty(window, "IDBKeyRange", { configurable: true, value: IDBKeyRange });
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
  } else {
    Reflect.deleteProperty(window, "isSecureContext");
    Reflect.deleteProperty(navigator, "serviceWorker");
    Reflect.deleteProperty(window, "indexedDB");
    Reflect.deleteProperty(window, "IDBKeyRange");
  }
};

/** Puts the test in "installed app" mode so the vault UI renders past the gate. */
export const runAsInstalledApp = () => {
  installPwaCapabilities(true);
  setStandalone(true);
};
