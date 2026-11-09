import { DownloadIcon } from "lucide-react";
import { GATE_COPY, INSTALL_STEPS } from "@/constants/install-steps.constants";
import { InstallPlatform } from "@/enums/pwa.enum";
import type { InstallPromptState } from "@/interfaces/pwa.interface";
import { Button } from "@/components/ui/button";
import { GateLayout } from "@/components/modules/pwa/gate-layout";
import { InstallSteps } from "@/components/modules/pwa/install-steps";

interface InstallScreenProps extends InstallPromptState {
  platform: InstallPlatform;
}

/** Shown in a browser tab: PiVault only runs once installed. */
export function InstallScreen({
  platform,
  canPrompt,
  installed,
  promptInstall,
}: InstallScreenProps) {
  if (installed) {
    return <GateLayout title={GATE_COPY.installedTitle} description={GATE_COPY.installedBody} />;
  }

  if (platform === InstallPlatform.Unsupported && !canPrompt) {
    return (
      <GateLayout title={GATE_COPY.wrongBrowserTitle} description={GATE_COPY.wrongBrowserBody} />
    );
  }

  return (
    <GateLayout
      title={GATE_COPY.installTitle}
      description={GATE_COPY.installBody}
      footer={
        canPrompt && (
          <Button size="xl" className="w-full shadow-float" onClick={() => void promptInstall()}>
            <DownloadIcon data-icon="inline-start" />
            {GATE_COPY.installButton}
          </Button>
        )
      }
    >
      {!canPrompt && <InstallSteps steps={INSTALL_STEPS[platform]} />}
    </GateLayout>
  );
}
