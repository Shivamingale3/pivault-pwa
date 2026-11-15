import { Outlet } from "react-router";
import { useAutoLock } from "@/hooks/use-auto-lock";
import { VaultProvider } from "@/providers/vault.provider";

/**
 * Everything behind the unlocked zone: the decrypted vault exists only in here, and the app
 * locks itself after time in the background.
 */
export function PrivateLayout() {
  useAutoLock();
  return (
    <VaultProvider>
      <Outlet />
    </VaultProvider>
  );
}
