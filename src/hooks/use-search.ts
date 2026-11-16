import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { EntryKind } from "@/enums/vault.enum";
import { useVault } from "@/hooks/use-vault";
import { entryPath } from "@/routes/route-paths";
import { recentSearches, rememberSearch } from "@/services/search-history.service";
import type { NoteEntry, PasswordEntry, VaultEntry } from "@/types/vault.types";

/**
 * Search across passwords (title, username, site) and notes (title only: the text stays out of
 * search). Passwords themselves are never matched. Recent searches live in memory only.
 */
export function useSearch() {
  const { entries } = useVault();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<readonly string[]>(recentSearches);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === "") return { passwords: [] as PasswordEntry[], notes: [] as NoteEntry[] };
    const passwords = entries.filter(
      (entry): entry is PasswordEntry =>
        entry.kind === EntryKind.Password &&
        [entry.title, entry.username, entry.url].some((value) =>
          value.toLowerCase().includes(needle),
        ),
    );
    const notes = entries.filter(
      (entry): entry is NoteEntry =>
        entry.kind === EntryKind.Note && entry.title.toLowerCase().includes(needle),
    );
    return { passwords, notes };
  }, [entries, query]);

  return {
    query,
    setQuery,
    searching: query.trim() !== "",
    results,
    nothingFound: results.passwords.length + results.notes.length === 0,
    recent,
    /** Opens the item and remembers what was searched for. */
    open: (entry: VaultEntry) => {
      setRecent(rememberSearch(query));
      void navigate(
        entry.kind === EntryKind.Password ? entryPath.password(entry.id) : entryPath.note(entry.id),
      );
    },
    done: () => {
      void navigate(-1);
    },
  };
}
