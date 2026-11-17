import { useState } from "react";
import { wrongPinMessage } from "@/constants/lock.constants";
import { useAuth } from "@/hooks/use-auth";
import { type RunStep, useKeyReplacementRun } from "@/hooks/use-key-replacement-run";
import { useNewKeySteps } from "@/hooks/use-new-key-steps";
import { usePinEntry } from "@/hooks/use-pin-entry";
import { useSync } from "@/hooks/use-sync";
import { verifyPin } from "@/services/app-lock.service";
import { beginKeyReplacement } from "@/services/key-rotation.service";
import { errorMessage } from "@/utils/error-message.utils";

export type ReplaceStage = "intro" | "pin" | "reveal" | "confirm" | "working" | "done";

/**
 * Settings › Recovery key: PIN, then the new key shown once and typed back, then the switch.
 * Needs the Pi: it refuses to start offline or when this phone no longer syncs.
 */
export function useReplaceRecoveryKey() {
  const { lock } = useAuth();
  const { status } = useSync();
  const run = useKeyReplacementRun();
  const [stage, setStage] = useState<ReplaceStage>("intro");
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState<{ step: RunStep; done: number; total: number }>({
    step: "items",
    done: 0,
    total: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const blocked = status === "ended" ? "ended" : status === "offline" ? "offline" : null;

  const switchKeys = async (key: string | null) => {
    setRunning(true);
    setError(null);
    setStage("working");
    try {
      if (key) await beginKeyReplacement(key);
      await run((step, done = 0, total = 0) => {
        setProgress({ step, done, total });
      });
      setStage("done");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setRunning(false);
    }
  };

  const steps = useNewKeySteps(
    (key) => void switchKeys(key),
    () => {
      setStage("reveal");
    },
  );

  const pin = usePinEntry({
    disabled: checking,
    onComplete: (entered) => {
      setChecking(true);
      verifyPin(entered)
        .then((result) => {
          if (result.ok) {
            setPinMessage(null);
            setStage("reveal");
          } else if (result.reason === "locked-out") {
            lock();
          } else {
            setPinMessage(wrongPinMessage(result.attemptsLeft));
            pin.shake();
          }
        })
        .catch((caught: unknown) => {
          pin.clear();
          setPinMessage(errorMessage(caught));
        })
        .finally(() => {
          setChecking(false);
        });
    },
  });

  return {
    stage,
    blocked,
    start: () => {
      if (!blocked) setStage("pin");
    },
    pin,
    pinMessage,
    checking,
    reveal: {
      ...steps.reveal,
      next: () => {
        if (steps.reveal.saved) setStage("confirm");
      },
    },
    confirm: steps.confirm(running, null),
    progress,
    error,
    running,
    /** After a failure: carry on from where it stopped (the new key is already kept). */
    retry: () => void switchKeys(null),
  };
}
