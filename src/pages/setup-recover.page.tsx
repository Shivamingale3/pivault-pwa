import { RecoverScreen } from "@/components/modules/setup/recover-screen";
import { useRecoverVault } from "@/hooks/use-recover-vault";
import { useSession } from "@/hooks/use-session";

export function SetupRecoverPage() {
  const session = useSession();
  return <RecoverScreen recover={useRecoverVault()} email={session?.email ?? ""} />;
}
