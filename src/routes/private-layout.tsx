import { Outlet } from "react-router";
import { useAutoLock } from "@/hooks/use-auto-lock";
import { SyncProvider } from "@/providers/sync.provider";
import { VaultProvider } from "@/providers/vault.provider";

/**
 * Everything behind the unlocked zone: the decrypted vault and the sync exist only in here, and
 * the app locks itself after time in the background.
 */
export function PrivateLayout() {
  useAutoLock();
  return (
    <VaultProvider>
      <SyncProvider>
        <Outlet />
      </SyncProvider>
    </VaultProvider>
  );
}
