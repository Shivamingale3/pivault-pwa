import { RecoveryConfirmScreen } from "@/components/modules/setup/recovery-confirm-screen";
import { useRecoveryConfirm } from "@/hooks/use-recovery-confirm";

export function SetupRecoveryConfirmPage() {
  return <RecoveryConfirmScreen confirm={useRecoveryConfirm()} />;
}
