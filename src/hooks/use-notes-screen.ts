import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { EntryKind } from "@/enums/vault.enum";
import { useVault } from "@/hooks/use-vault";
import { ROUTES, entryPath } from "@/routes/route-paths";
import type { NoteEntry } from "@/types/vault.types";

/** The Notes tab: the notes newest first, filtered by title as you type. */
export function useNotesScreen() {
  const { entries, status } = useVault();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const notes = useMemo(
    () => entries.filter((entry): entry is NoteEntry => entry.kind === EntryKind.Note),
    [entries],
  );
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notes.filter((note) => needle === "" || note.title.toLowerCase().includes(needle));
  }, [notes, query]);

  return {
    status,
    total: notes.length,
    visible,
    query,
    setQuery,
    filtering: query.trim() !== "",
    open: (note: NoteEntry) => {
      void navigate(entryPath.note(note.id));
    },
    write: () => {
      void navigate(ROUTES.noteNew);
    },
  };
}
