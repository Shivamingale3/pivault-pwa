/** jsdom has no matchMedia; this controllable stub lets tests flip the OS colour scheme. */
type Listener = (event: MediaQueryListEvent) => void;

let listeners = new Set<Listener>();
let matches = false;

export const installMatchMedia = (prefersDark: boolean) => {
  matches = prefersDark;
  listeners = new Set();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        get matches() {
          return matches;
        },
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
        removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
        addListener: (listener: Listener) => listeners.add(listener),
        removeListener: (listener: Listener) => listeners.delete(listener),
        dispatchEvent: () => true,
      }) as unknown as MediaQueryList,
  });
};

/** Simulates the OS switching between light and dark. */
export const setSystemDark = (prefersDark: boolean) => {
  matches = prefersDark;
  listeners.forEach((listener) => {
    listener({ matches: prefersDark } as MediaQueryListEvent);
  });
};
