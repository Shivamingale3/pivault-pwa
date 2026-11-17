import { useState } from "react";
import { toast } from "sonner";
import { RECOVERY_KEY_GROUP_SIZE } from "@/constants/crypto.constants";
import { KEY_FILENAME, SETUP_COPY } from "@/constants/setup.constants";
import { CLIPBOARD_MESSAGES } from "@/constants/vault.constants";
import { generateRecoveryKey } from "@/services/crypto.service";
import { copySecret } from "@/utils/clipboard.utils";
import { downloadText } from "@/utils/download.utils";
import { formatRecoveryKey } from "@/utils/recovery-key.utils";

const clean = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^0-9a-f]/g, "")
    .slice(0, RECOVERY_KEY_GROUP_SIZE);

/**
 * The new key's "shown once" and "prove you saved it" steps, shaped like the setup screens' hooks
 * so the same screens are reused. The key lives in memory only.
 */
export function useNewKeySteps(onConfirmed: (key: string) => void, onShowAgain: () => void) {
  const [key] = useState(generateRecoveryKey);
  const displayKey = formatRecoveryKey(key);
  const [saved, setSaved] = useState(false);
  const [second, setSecond] = useState("");
  const [fourth, setFourth] = useState("");
  const group = (index: number) =>
    key.slice(index * RECOVERY_KEY_GROUP_SIZE, (index + 1) * RECOVERY_KEY_GROUP_SIZE);
  const valid = second === group(1) && fourth === group(3);

  return {
    key,
    reveal: {
      displayKey,
      saved,
      setSaved,
      copy: async () => {
        if (await copySecret(displayKey)) toast.success(CLIPBOARD_MESSAGES.copied("Recovery key"));
        else toast.error(CLIPBOARD_MESSAGES.failed);
      },
      download: () => {
        downloadText(
          KEY_FILENAME,
          `${SETUP_COPY.keyFileHeader}\n\n${displayKey}\n\n${SETUP_COPY.keyFileNote}\n`,
        );
      },
      /** Replaced by the screen that moves on (see use-replace-recovery-key). */
      next: (): void => undefined,
    },
    confirm: (pending: boolean, error: string | null) => ({
      second,
      fourth,
      setSecond: (value: string) => {
        setSecond(clean(value));
      },
      setFourth: (value: string) => {
        setFourth(clean(value));
      },
      valid,
      pending,
      error,
      finish: () => {
        if (valid && !pending) onConfirmed(key);
        return Promise.resolve();
      },
      showAgain: onShowAgain,
    }),
  };
}
