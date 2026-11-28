import { useMemo } from "react";
import { useNavigate } from "react-router";
import { EntryKind } from "@/enums/vault.enum";
import { useVault } from "@/hooks/use-vault";
import { ROUTES, entryPath } from "@/routes/route-paths";
import type { NoteEntry } from "@/types/vault.types";

/** Home's note list: every note, newest first. */
export function useNoteList() {
  const { entries, status } = useVault();
  const navigate = useNavigate();

  const visible = useMemo(
    () => entries.filter((entry): entry is NoteEntry => entry.kind === EntryKind.Note),
    [entries],
  );

  return {
    status,
    total: visible.length,
    visible,
    open: (note: NoteEntry) => {
      void navigate(entryPath.note(note.id));
    },
    write: () => {
      void navigate(ROUTES.noteNew);
    },
  };
}
