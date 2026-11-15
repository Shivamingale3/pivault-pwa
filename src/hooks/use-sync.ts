import { use } from "react";
import { SyncContext } from "@/contexts/sync.context";
import type { SyncContextValue } from "@/interfaces/sync.interface";

export function useSync(): SyncContextValue {
  const context = use(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider.");
  }
  return context;
}
