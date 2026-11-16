import { useMemo, useState } from "react";
import { useLocation } from "react-router";
import { EntryKind } from "@/enums/vault.enum";
import { useUsage } from "@/hooks/use-usage";
import { useVault } from "@/hooks/use-vault";
import type { NoteEntry } from "@/types/vault.types";

/** The Notes tab: the notes newest first, filtered by title as you type. */
export function useNotesScreen() {
  const { entries, status } = useVault();
  const { touch } = useUsage();
  const openId = (useLocation().state as { open?: string } | null)?.open;
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
    opened: (note: NoteEntry) => {
      touch(note.id, EntryKind.Note);
    },
    openId,
  };
}
