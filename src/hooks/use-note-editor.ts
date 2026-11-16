import { useState } from "react";
import { EntryKind } from "@/enums/vault.enum";
import { useAutosave } from "@/hooks/use-autosave";
import { type NoteInput, entryPayloadSchema } from "@/schemas/vault.schema";
import type { NoteEntry } from "@/types/vault.types";
import { type Format, applyFormat } from "@/utils/markdown-edit.utils";

const MAX_UNDO = 50;

/** The note editor: title, body, toolbar formats, undo, and saving by itself as you type. */
export function useNoteEditor(entry: NoteEntry | null) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [history, setHistory] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const input: NoteInput = { kind: EntryKind.Note, title, body };
  const save = useAutosave(entry?.id ?? null, input, entryPayloadSchema.safeParse(input).success);

  const remember = (previous: string) => {
    setHistory((current) => [...current.slice(-(MAX_UNDO - 1)), previous]);
  };

  return {
    title,
    setTitle,
    body,
    save,
    status: save.status,
    deleting,
    setDeleting,
    canUndo: history.length > 0,
    type: (next: string) => {
      // One undo step per word or line, not per keystroke.
      if (/\s$/.test(next) !== /\s$/.test(body) || history.length === 0) remember(body);
      setBody(next);
    },
    /** Applies a format to the selection in the body's text area. */
    format: (format: Format, element: HTMLTextAreaElement | null) => {
      const start = element?.selectionStart ?? body.length;
      const end = element?.selectionEnd ?? body.length;
      const edit = applyFormat(body, start, end, format);
      remember(body);
      setBody(edit.text);
      requestAnimationFrame(() => {
        element?.focus();
        element?.setSelectionRange(edit.start, edit.end);
      });
    },
    undo: () => {
      const previous = history.at(-1);
      if (previous === undefined) return;
      setHistory((current) => current.slice(0, -1));
      setBody(previous);
    },
  };
}
