import { createContext } from "react";
import type { EntryKind } from "@/enums/vault.enum";
import type { UsageMap } from "@/schemas/usage.schema";

export interface UsageContextValue {
  usage: UsageMap;
  /** Marks an item as used now (opened, revealed, copied). */
  touch: (id: string, kind: EntryKind) => void;
  /** Forgets every recent item. */
  clear: () => void;
}

export const UsageContext = createContext<UsageContextValue | null>(null);
