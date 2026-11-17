import { useEffect } from "react";
import { Outlet } from "react-router";
import { useAutoLock } from "@/hooks/use-auto-lock";
import { UsageProvider } from "@/providers/usage.provider";
import { SyncProvider } from "@/providers/sync.provider";
import { ensureKeyCheckStored } from "@/services/key-check.service";
import { loadPreferences } from "@/services/preferences.service";
import { keepStorage } from "@/utils/storage.utils";
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
  // Older accounts: give the server the recovery-key check once. Quietly retried on the next unlock.
  useEffect(() => {
    ensureKeyCheckStored().catch(() => undefined);
    void keepStorage();
    void loadPreferences();
  }, []);
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
