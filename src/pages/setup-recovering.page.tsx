import { RecoveringScreen } from "@/components/modules/setup/recovering-screen";
import { useRebuildVault } from "@/hooks/use-rebuild-vault";

export function SetupRecoveringPage() {
  return <RecoveringScreen rebuild={useRebuildVault()} />;
}
