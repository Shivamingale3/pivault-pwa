import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useVault } from "@/hooks/use-vault";
import { errorMessage } from "@/utils/error-message.utils";
import type { EntryInput } from "@/schemas/vault.schema";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/** How long typing must pause before the change is saved. */
export const AUTOSAVE_DELAY_MS = 600;

/**
 * Saves the form by itself after a short pause: the first valid version creates the entry, later
 * ones update it. Saves run one after another, and a pending change is written when the screen closes.
 */
export function useAutosave(initialId: string | null, input: EntryInput, valid: boolean) {
  const { add, edit } = useVault();
  const snapshot = JSON.stringify(input);
  const [status, setStatus] = useState<SaveStatus>(initialId ? "saved" : "idle");
  const id = useRef(initialId);
  const [savedId, setSavedId] = useState(initialId);
  const saved = useRef(initialId ? snapshot : null);
  const latest = useRef({ input, snapshot, valid });
  const queue = useRef<Promise<void>>(Promise.resolve());
  const stopped = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    latest.current = { input, snapshot, valid };
  });

  const flush = useCallback(() => {
    queue.current = queue.current.then(async () => {
      const { input: next, snapshot: nextSnapshot, valid: nextValid } = latest.current;
      if (stopped.current || !nextValid || nextSnapshot === saved.current) return;
      try {
        if (id.current) await edit(id.current, next);
        else {
          id.current = (await add(next)).id;
          if (mounted.current) setSavedId(id.current);
        }
        saved.current = nextSnapshot;
        if (mounted.current)
          setStatus(latest.current.snapshot === nextSnapshot ? "saved" : "saving");
      } catch (error) {
        if (mounted.current) {
          setStatus("error");
          toast.error(errorMessage(error));
        }
      }
    });
    return queue.current;
  }, [add, edit]);

  useEffect(() => {
    // Back to what is saved (typed and undone), or not saveable yet: nothing is pending.
    if (snapshot === saved.current) {
      setStatus(id.current ? "saved" : "idle");
      return;
    }
    if (!valid) {
      setStatus("idle");
      return;
    }
    setStatus("saving");
    const timer = setTimeout(() => void flush(), AUTOSAVE_DELAY_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [snapshot, valid, flush]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      void flush();
    };
  }, [flush]);

  return {
    status,
    /** The entry's id once it exists. */
    id: savedId,
    /** Writes any pending change now. */
    flush,
    /** Stops saving and waits for a save that is already running (the entry is about to be deleted). */
    pause: (): Promise<void> => {
      stopped.current = true;
      return queue.current;
    },
    /** Saving carries on (the delete didn't happen). */
    resume: () => {
      stopped.current = false;
    },
  };
}
