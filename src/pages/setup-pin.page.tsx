import { PinSetupScreen } from "@/components/modules/setup/pin-setup-screen";
import { usePinSetupFlow } from "@/hooks/use-pin-setup-flow";

export function SetupPinPage() {
  return <PinSetupScreen flow={usePinSetupFlow()} />;
}
