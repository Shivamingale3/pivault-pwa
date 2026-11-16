import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { EntryKind } from "@/enums/vault.enum";
import { useVault } from "@/hooks/use-vault";
import type { NoteEntry } from "@/types/vault.types";
import { errorMessage } from "@/utils/error-message.utils";
import { toggleCheck } from "@/utils/markdown.utils";

/**
 * Ticks a note's checkboxes from the read view. Each tick builds on the one before it, not on what
 * is on screen, and the saves run in order: two quick ticks can't undo each other.
 */
export function useNoteChecklist(entry: NoteEntry | null) {
  const { edit } = useVault();
  const pending = useRef<{ id: string; body: string } | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const current = useRef(entry);

  useEffect(() => {
    current.current = entry;
    // The screen caught up with the last tick (or shows another note): nothing is pending.
    if (!entry || pending.current?.id !== entry.id || pending.current.body === entry.body) {
      pending.current = null;
    }
  }, [entry]);

  return useCallback(
    (line: number) => {
      const note = current.current;
      if (!note) return;
      const base = pending.current?.id === note.id ? pending.current.body : note.body;
      const body = toggleCheck(base, line);
      pending.current = { id: note.id, body };
      queue.current = queue.current
        .then(() => edit(note.id, { kind: EntryKind.Note, title: note.title, body }))
        .catch((error: unknown) => {
          pending.current = null;
          toast.error(errorMessage(error));
        });
    },
    [edit],
  );
}
