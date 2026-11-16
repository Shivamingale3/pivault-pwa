import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { KEY_FILENAME, SETUP_COPY } from "@/constants/setup.constants";
import { CLIPBOARD_MESSAGES } from "@/constants/vault.constants";
import { useRecoveryKeyDraft } from "@/hooks/use-recovery-key-draft";
import { ROUTES } from "@/routes/route-paths";
import { copySecret } from "@/utils/clipboard.utils";
import { downloadText } from "@/utils/download.utils";

/** "Your recovery key": copy (cleared from the clipboard after 30 s), download, and the saved checkbox. */
export function useRecoveryReveal() {
  const navigate = useNavigate();
  const { displayKey } = useRecoveryKeyDraft();
  const [saved, setSaved] = useState(false);

  return {
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
    next: () => {
      if (saved) void navigate(ROUTES.setupRecoveryConfirm);
    },
  };
}
