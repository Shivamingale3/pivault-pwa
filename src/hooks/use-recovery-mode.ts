import { useEffect, useState } from "react";
import { toast } from "sonner";
import { loadSession } from "@/services/session.service";
import { errorMessage } from "@/utils/error-message.utils";

/**
 * `create`: first login, generate and show a recovery key. `enter`: the account already has one
 * (a new device), so ask for it. `error` (never guess) when the saved account can't be read.
 */
export type RecoveryMode = "loading" | "create" | "enter" | "error";

export function useRecoveryMode(): RecoveryMode {
  const [mode, setMode] = useState<RecoveryMode>("loading");

  useEffect(() => {
    let cancelled = false;
    loadSession()
      .then((session) => {
        if (cancelled) return;
        setMode(!session ? "error" : session.recoveryKeyConfigured ? "enter" : "create");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        toast.error(errorMessage(error));
        setMode("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return mode;
}
