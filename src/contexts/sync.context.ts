import { createContext } from "react";
import type { SyncContextValue } from "@/interfaces/sync.interface";

export const SyncContext = createContext<SyncContextValue | null>(null);
