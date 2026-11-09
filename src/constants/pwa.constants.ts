/** Display modes that mean PiVault is running as an installed app, not a browser tab. */
export const INSTALLED_DISPLAY_MODES = [
  "standalone",
  "fullscreen",
  "minimal-ui",
  "window-controls-overlay",
] as const;

export const displayModeQuery = (mode: string) => `(display-mode: ${mode})`;

/** Trusted Web Activity (Android app wrapper) launches carry this referrer. */
export const TWA_REFERRER_PREFIX = "android-app://";

/**
 * Pages reachable in a normal browser tab. Reset-password links arrive by email and open in
 * the browser; that page only talks to the server and touches no keys or vault data.
 */
export const PWA_BYPASS_PATHS: readonly string[] = ["/reset-password"];

/** How often a running app checks for a new deploy. */
export const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000;

export const PWA_MESSAGES = {
  offlineReady: "Ready to work offline",
  offlineReadyDescription: "PiVault now opens without a connection.",
  registerError: "Offline support could not start",
  registerErrorDescription: "PiVault still works online. Reopen the app to try again.",
  installError: "Install didn't start",
  installErrorDescription: "Use your browser menu to install PiVault instead.",
} as const;
