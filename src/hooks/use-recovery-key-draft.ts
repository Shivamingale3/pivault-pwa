import { use } from "react";
import {
  RecoveryKeyDraftContext,
  type RecoveryKeyDraft,
} from "@/contexts/recovery-key-draft.context";

export function useRecoveryKeyDraft(): RecoveryKeyDraft {
  const draft = use(RecoveryKeyDraftContext);
  if (!draft) {
    throw new Error("useRecoveryKeyDraft must be used within a RecoveryKeyDraftProvider.");
  }
  return draft;
}
