import { useCallback } from "react";
import { RECOVERY_KEY_COPY } from "@/constants/settings.constants";
import { StorageErrorKind } from "@/enums/storage.enum";
import { useSync } from "@/hooks/use-sync";
import { StorageError } from "@/services/storage.error";
import {
  allOnServer,
  completeKeyReplacement,
  reencryptVault,
} from "@/services/key-rotation.service";

export type RunStep = "items" | "upload" | "switch";

/**
 * Steps 2 to 4 of a recovery-key replacement (see key-rotation.service): encrypt again, send
 * everything to the Pi and make sure it all arrived, then retire the old key. Safe to run again
 * after a failure: finished work is skipped.
 */
export function useKeyReplacementRun() {
  const { syncNow } = useSync();
  return useCallback(
    async (report?: (step: RunStep, done?: number, total?: number) => void) => {
      report?.("items", 0, 0);
      await reencryptVault((done, total) => {
        report?.("items", done, total);
      });
      report?.("upload");
      await syncNow();
      // One more round catches changes that arrived while the first one ran.
      if (!(await allOnServer())) await syncNow();
      if (!(await allOnServer())) {
        throw new StorageError(StorageErrorKind.Failed, RECOVERY_KEY_COPY.notAllSent);
      }
      report?.("switch");
      await completeKeyReplacement();
    },
    [syncNow],
  );
}
