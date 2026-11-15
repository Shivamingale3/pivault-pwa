import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { VAULT_MESSAGES } from "@/constants/vault.constants";
import { VaultContext } from "@/contexts/vault.context";
import type { VaultContextValue, VaultStatus } from "@/interfaces/vault.interface";
import { addEntry, editEntry, removeEntry, watchEntries } from "@/services/vault.service";
import type { VaultSnapshot } from "@/types/vault.types";
import { errorMessage } from "@/utils/error-message.utils";

const EMPTY: VaultSnapshot = { entries: [], unreadable: 0 };

/**
 * Lives only while the app is unlocked: it decrypts the entries into memory and drops them again
 * the moment it unmounts (lock or sign out). The database itself only ever holds ciphertext.
 */
export function VaultProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<VaultStatus>("loading");
  const [snapshot, setSnapshot] = useState<VaultSnapshot>(EMPTY);

  useEffect(() => {
    const subscription = watchEntries().subscribe({
      next: (next) => {
        setSnapshot(next);
        setStatus("ready");
      },
      error: (error: unknown) => {
        toast.error(errorMessage(error));
        setSnapshot(EMPTY);
        setStatus("error");
      },
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const { unreadable } = snapshot;
  useEffect(() => {
    if (unreadable > 0) toast.error(VAULT_MESSAGES.unreadable(unreadable));
  }, [unreadable]);

  const value = useMemo<VaultContextValue>(
    () => ({
      status,
      entries: snapshot.entries,
      unreadable,
      add: addEntry,
      edit: editEntry,
      remove: removeEntry,
    }),
    [status, snapshot.entries, unreadable],
  );

  return <VaultContext value={value}>{children}</VaultContext>;
}
