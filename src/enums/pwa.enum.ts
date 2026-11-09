/** How the current browser lets the user install PiVault. */
export const InstallPlatform = {
  /** Chrome, Edge, Samsung Internet, Android browsers: native `beforeinstallprompt`. */
  Chromium: "chromium",
  /** Safari / Chrome on iPhone and iPad: Share › Add to Home Screen. */
  Ios: "ios",
  /** Safari on macOS: File › Add to Dock. */
  MacosSafari: "macos-safari",
  /** Firefox on Android: menu › Install. */
  FirefoxAndroid: "firefox-android",
  /** Desktop Firefox and anything else that cannot install a PWA. */
  Unsupported: "unsupported",
} as const;

export type InstallPlatform = (typeof InstallPlatform)[keyof typeof InstallPlatform];

/** Which screen the install gate renders. */
export const GateState = {
  Unsupported: "unsupported",
  Bypass: "bypass",
  Installed: "installed",
  Install: "install",
} as const;

export type GateState = (typeof GateState)[keyof typeof GateState];
