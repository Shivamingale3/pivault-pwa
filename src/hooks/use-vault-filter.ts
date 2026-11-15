import { useMemo, useState } from "react";
import type { EntryKind } from "@/enums/vault.enum";
import type { VaultEntry } from "@/types/vault.types";

export type KindFilter = "all" | EntryKind;

const matches = (entry: VaultEntry, query: string): boolean => {
  const haystack =
    entry.kind === "password" ? [entry.title, entry.username, entry.url] : [entry.title];
  return haystack.some((value) => value.toLowerCase().includes(query));
};

/** The kind filter and the search box. Searches titles, usernames and sites, never passwords. */
export function useVaultFilter(entries: VaultEntry[]) {
  const [kind, setKind] = useState<KindFilter>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter(
      (entry) =>
        (kind === "all" || entry.kind === kind) && (needle === "" || matches(entry, needle)),
    );
  }, [entries, kind, query]);

  return {
    kind,
    setKind,
    query,
    setQuery,
    visible,
    filtering: kind !== "all" || query.trim() !== "",
  };
}
