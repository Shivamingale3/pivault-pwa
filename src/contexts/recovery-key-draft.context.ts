import { createContext } from "react";

export interface RecoveryKeyDraft {
  /** The new key as 64 hex characters. Memory only: never stored, never sent. */
  recoveryKey: string;
  /** The same key in groups (`xxxxxxxx-xxxxxxxx-...`) for display. */
  displayKey: string;
}

export const RecoveryKeyDraftContext = createContext<RecoveryKeyDraft | null>(null);
