/**
 * jsdom has no matchMedia. This controllable stub answers each media query separately, so tests
 * can flip the OS colour scheme or the PWA display mode and fire `change` listeners.
 */
type Listener = (event: MediaQueryListEvent) => void;

const PREFERS_DARK = "(prefers-color-scheme: dark)";
const STANDALONE = "(display-mode: standalone)";

let listeners = new Map<string, Set<Listener>>();
let answers = new Map<string, boolean>();

const listenersFor = (query: string) => {
  let set = listeners.get(query);
  if (!set) {
    set = new Set();
    listeners.set(query, set);
  }
  return set;
};

export const installMatchMedia = (prefersDark: boolean) => {
  answers = new Map([[PREFERS_DARK, prefersDark]]);
  listeners = new Map();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        get matches() {
          return answers.get(query) ?? false;
        },
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: Listener) => listenersFor(query).add(listener),
        removeEventListener: (_type: string, listener: Listener) =>
          listenersFor(query).delete(listener),
        addListener: (listener: Listener) => listenersFor(query).add(listener),
        removeListener: (listener: Listener) => listenersFor(query).delete(listener),
        dispatchEvent: () => true,
      }) as unknown as MediaQueryList,
  });
};

/** Sets a query's answer and notifies its listeners. */
export const setMediaQuery = (query: string, value: boolean) => {
  answers.set(query, value);
  listenersFor(query).forEach((listener) => {
    listener({ matches: value, media: query } as MediaQueryListEvent);
  });
};

/** Simulates the OS switching between light and dark. */
export const setSystemDark = (prefersDark: boolean) => {
  setMediaQuery(PREFERS_DARK, prefersDark);
};

/** Simulates launching as the installed app (or back to a browser tab). */
export const setStandalone = (standalone: boolean) => {
  setMediaQuery(STANDALONE, standalone);
};
