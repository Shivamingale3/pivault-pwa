import { GATE_COPY, SUPPORTED_BROWSERS } from "@/constants/install-steps.constants";
import { GateLayout } from "@/components/modules/pwa/gate-layout";

export function UnsupportedScreen() {
  return (
    <GateLayout title={GATE_COPY.unsupportedTitle} description={GATE_COPY.unsupportedBody}>
      <p className="rounded-lg bg-muted p-4.5 text-[0.8125rem] leading-relaxed font-medium">
        Use the latest {SUPPORTED_BROWSERS}, and open PiVault over https.
      </p>
    </GateLayout>
  );
}
