import type { ReactNode } from "react";
import { GateState } from "@/enums/pwa.enum";
import { useInstallGate } from "@/hooks/use-install-gate";
import { InstallScreen } from "@/components/modules/pwa/install-screen";
import { UnsupportedScreen } from "@/components/modules/pwa/unsupported-screen";

interface InstallGateProps {
  children: ReactNode;
}

/** Renders the app only when installed as a PWA (or on a bypass page such as /reset-password). */
export function InstallGate({ children }: InstallGateProps) {
  const { state, platform, installPrompt } = useInstallGate();

  switch (state) {
    case GateState.Unsupported:
      return <UnsupportedScreen />;
    case GateState.Install:
      return <InstallScreen platform={platform} {...installPrompt} />;
    case GateState.Installed:
    case GateState.Bypass:
      return children;
  }
}
