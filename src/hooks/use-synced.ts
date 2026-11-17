import { useEffect, useState } from "react";
import { type SyncedState, isSynced, watchSyncedState } from "@/services/synced-state.service";

/** Whether items are synced, kept up to date as sync reports come in. */
export function useSyncedState() {
  const [state, setState] = useState<SyncedState>({});
  useEffect(() => {
    const subscription = watchSyncedState().subscribe(setState);
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return {
    /** True when the server holds this exact version of the item. */
    synced: (id: string, updatedAt: number) => isSynced(state, id, updatedAt),
  };
}
