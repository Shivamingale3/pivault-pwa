import { useEffect } from "react";
import { Outlet } from "react-router";
import { useAutoLock } from "@/hooks/use-auto-lock";
import { UsageProvider } from "@/providers/usage.provider";
import { SyncProvider } from "@/providers/sync.provider";
import { clearSearchHistory } from "@/services/search-history.service";
import { VaultProvider } from "@/providers/vault.provider";

/**
 * Everything behind the unlocked zone: the decrypted vault and the sync exist only in here, and
 * the app locks itself after time in the background.
 */
export function PrivateLayout() {
  useAutoLock();
  // Search terms can reveal what is in the vault: gone when the app locks or the user signs out.
  useEffect(() => clearSearchHistory, []);
  return (
    <VaultProvider>
      <SyncProvider>
        <UsageProvider>
          <Outlet />
        </UsageProvider>
      </SyncProvider>
    </VaultProvider>
  );
}
