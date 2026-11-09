import {
  AppWindowIcon,
  EllipsisVerticalIcon,
  MonitorDownIcon,
  PlusSquareIcon,
  ShareIcon,
  type LucideIcon,
} from "lucide-react";
import { InstallPlatform } from "@/enums/pwa.enum";

export interface InstallStep {
  icon: LucideIcon;
  title: string;
  detail: string;
}

/** Manual instructions for browsers without a native install prompt (or before it fires). */
export const INSTALL_STEPS: Record<InstallPlatform, readonly InstallStep[]> = {
  [InstallPlatform.Chromium]: [
    {
      icon: MonitorDownIcon,
      title: "Open the browser menu",
      detail: "Look for the install icon in the address bar, or open the ⋮ menu.",
    },
    {
      icon: AppWindowIcon,
      title: "Choose “Install PiVault”",
      detail: "On Android it may read “Add to Home screen”.",
    },
  ],
  [InstallPlatform.Ios]: [
    {
      icon: ShareIcon,
      title: "Tap Share",
      detail: "The square with an arrow, in Safari's toolbar.",
    },
    {
      icon: PlusSquareIcon,
      title: "Tap “Add to Home Screen”",
      detail: "Scroll the share sheet if you don't see it, then tap Add.",
    },
  ],
  [InstallPlatform.MacosSafari]: [
    {
      icon: ShareIcon,
      title: "Open File in the menu bar",
      detail: "Or use the Share button in Safari's toolbar.",
    },
    {
      icon: AppWindowIcon,
      title: "Choose “Add to Dock”",
      detail: "PiVault then opens from the Dock like any other app.",
    },
  ],
  [InstallPlatform.FirefoxAndroid]: [
    {
      icon: EllipsisVerticalIcon,
      title: "Open the ⋮ menu",
      detail: "At the bottom or top of the screen, depending on your toolbar.",
    },
    {
      icon: PlusSquareIcon,
      title: "Tap “Install”",
      detail: "Or “Add to Home screen”, then confirm.",
    },
  ],
  [InstallPlatform.Unsupported]: [],
};

export const SUPPORTED_BROWSERS =
  "Chrome, Edge or Samsung Internet, or Safari on iPhone, iPad and Mac";

export const GATE_COPY = {
  eyebrow: "Self-hosted on your Pi",
  installTitle: "Install PiVault",
  installBody:
    "PiVault runs as an installed app so your vault stays encrypted on this device and opens offline.",
  installButton: "Install app",
  installedTitle: "PiVault is installed",
  installedBody: "Open PiVault from your home screen, Dock or app list. You can close this tab.",
  unsupportedTitle: "This browser can't run PiVault",
  unsupportedBody:
    "PiVault needs a browser that can install apps and encrypt data on your device, over a secure connection.",
  wrongBrowserTitle: "Open PiVault in another browser",
  wrongBrowserBody: `This browser can't install apps. Open this page in ${SUPPORTED_BROWSERS}.`,
} as const;
