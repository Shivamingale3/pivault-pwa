import { type ReactNode, useMemo, useState } from "react";
import {
  RecoveryKeyDraftContext,
  type RecoveryKeyDraft,
} from "@/contexts/recovery-key-draft.context";
import { generateRecoveryKey } from "@/services/crypto.service";
import { formatRecoveryKey } from "@/utils/recovery-key.utils";

/**
 * Holds the freshly generated recovery key while the user moves between "Your recovery key" and
 * "Prove you saved it" (and back). It lives only in this component's memory and is gone when setup
 * ends.
 */
export function RecoveryKeyDraftProvider({ children }: { children: ReactNode }) {
  const [recoveryKey] = useState(generateRecoveryKey);
  const value = useMemo<RecoveryKeyDraft>(
    () => ({ recoveryKey, displayKey: formatRecoveryKey(recoveryKey) }),
    [recoveryKey],
  );
  return <RecoveryKeyDraftContext value={value}>{children}</RecoveryKeyDraftContext>;
}
