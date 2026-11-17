import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { RECOVERY_KEY_COPY } from "@/constants/settings.constants";
import { useKeyReplacementRun } from "@/hooks/use-key-replacement-run";
import { hasPendingReplacement } from "@/services/key-rotation.service";

/**
 * Finishes a recovery-key replacement that was interrupted (app closed, connection lost) once the
 * vault is open again. Quiet: it only speaks up when it is done. Renders nothing.
 */
export function KeyReplacementResume() {
  const run = useKeyReplacementRun();
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      if (!(await hasPendingReplacement())) return;
      await run();
      toast.success(RECOVERY_KEY_COPY.doneToast);
    })().catch(() => undefined);
  }, [run]);
  return null;
}
