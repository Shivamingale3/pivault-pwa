import { toast } from "sonner";
import { CLIPBOARD_MESSAGES } from "@/constants/vault.constants";
import { currentPreferences } from "@/services/preferences.service";
import { copySecret } from "@/utils/clipboard.utils";

/** Copy to clipboard with a toast; a copied secret is cleared again after the time chosen in Security. */
export function useCopy() {
  return async (text: string, label: string) => {
    const clearAfterMs = currentPreferences().clipboardClearMs;
    if (await copySecret(text, clearAfterMs)) {
      toast.success(CLIPBOARD_MESSAGES.copied(label, clearAfterMs));
    } else toast.error(CLIPBOARD_MESSAGES.failed);
  };
}
