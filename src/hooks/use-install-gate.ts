import { useState } from "react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { useInstalledApp } from "@/hooks/use-installed-app";
import { getInstallPlatform, isPlatformSupported, resolveGateState } from "@/utils/pwa.utils";

/** Combines capability checks, install state and the current path into one gate decision. */
export function useInstallGate() {
  const installed = useInstalledApp();
  const installPrompt = useInstallPrompt();
  // Capabilities and browser don't change during a session: read them once.
  const [supported] = useState(isPlatformSupported);
  const [platform] = useState(() =>
    getInstallPlatform(navigator.userAgent, navigator.maxTouchPoints),
  );

  const state = resolveGateState({ supported, installed, pathname: window.location.pathname });

  return { state, platform, installPrompt };
}
