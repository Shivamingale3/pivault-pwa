import { useState } from "react";
import { toast } from "sonner";
import { CLIPBOARD_MESSAGES } from "@/constants/setup.constants";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { generateRecoveryKey } from "@/services/crypto.service";
import { finishSetupWithNewKey } from "@/services/setup.service";
import { formatRecoveryKey } from "@/utils/recovery-key.utils";

/**
 * First-login recovery key: generated once when the screen opens and kept only in this
 * component's memory. Finishing stores a non-extractable key, never the text.
 */
export function useNewRecoveryKey() {
  const { completeSetup } = useAuth();
  const request = useAuthRequest();
  const [recoveryKey] = useState(generateRecoveryKey);
  const [saved, setSaved] = useState(false);
  const displayKey = formatRecoveryKey(recoveryKey);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(displayKey);
      toast.success(CLIPBOARD_MESSAGES.copied);
    } catch {
      toast.error(CLIPBOARD_MESSAGES.failed);
    }
  };

  const finish = async () => {
    if (!saved || request.pending) return;
    const done = await request.run((signal) =>
      finishSetupWithNewKey(recoveryKey, signal).then(() => true),
    );
    if (done) completeSetup();
  };

  return {
    displayKey,
    saved,
    setSaved,
    copy,
    finish,
    pending: request.pending,
    error: request.error,
  };
}
