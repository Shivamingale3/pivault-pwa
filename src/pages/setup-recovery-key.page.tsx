import { RecoveryRevealScreen } from "@/components/modules/setup/recovery-reveal-screen";
import { useRecoveryReveal } from "@/hooks/use-recovery-reveal";

export function SetupRecoveryKeyPage() {
  return <RecoveryRevealScreen reveal={useRecoveryReveal()} />;
}
