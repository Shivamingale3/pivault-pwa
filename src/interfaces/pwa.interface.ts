/** Chromium-only event, not in lib.dom. https://developer.mozilla.org/docs/Web/API/BeforeInstallPromptEvent */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

/** iOS Safari exposes this non-standard flag when launched from the home screen. */
export interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export interface InstallPromptState {
  /** True once the browser offered a native install prompt we can trigger. */
  canPrompt: boolean;
  /** True after `appinstalled` fired in this tab. */
  installed: boolean;
  promptInstall: () => Promise<void>;
}
