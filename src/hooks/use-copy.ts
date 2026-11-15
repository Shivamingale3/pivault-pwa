import { toast } from "sonner";
import { CLIPBOARD_MESSAGES } from "@/constants/vault.constants";
import { copySecret } from "@/utils/clipboard.utils";

/** Copy to clipboard with a toast; copied secrets are cleared again after 30 seconds. */
export function useCopy() {
  return async (text: string, label: string) => {
    if (await copySecret(text)) toast.success(CLIPBOARD_MESSAGES.copied(label));
    else toast.error(CLIPBOARD_MESSAGES.failed);
  };
}
