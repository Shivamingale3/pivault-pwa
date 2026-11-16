import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useCopy } from "@/hooks/use-copy";
import { useSync } from "@/hooks/use-sync";
import { useUsage } from "@/hooks/use-usage";
import { useVault } from "@/hooks/use-vault";
import { EntryKind } from "@/enums/vault.enum";
import { ROUTES } from "@/routes/route-paths";
import type { PasswordEntry } from "@/types/vault.types";
import { isWeak } from "@/utils/password-strength.utils";

export type SortTab = "recent" | "az" | "weak";

interface LocationState {
  /** Set by the Sort pill: shows the sort state. A plain visit to the tab doesn't have it. */
  sort?: boolean;
  /** Open this entry's details straight away (from a recently opened row). */
  open?: string;
}

const matches = (entry: PasswordEntry, needle: string): boolean =>
  [entry.title, entry.username, entry.url].some((value) => value.toLowerCase().includes(needle));

/** The Passwords tab: filter, the sort state (Recent / A-Z / Weak), reveal and copy per row. */
export function usePasswordsScreen() {
  const { entries, status } = useVault();
  const { usage, touch } = useUsage();
  const { syncNow } = useSync();
  const copy = useCopy();
  const navigate = useNavigate();
  const state = (useLocation().state ?? {}) as LocationState;
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SortTab>("recent");
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());

  const passwords = useMemo(
    () => entries.filter((entry): entry is PasswordEntry => entry.kind === EntryKind.Password),
    [entries],
  );
  const sorting = state.sort === true;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = passwords.filter((entry) => needle === "" || matches(entry, needle));
    const lastUsed = (entry: PasswordEntry): number => usage[entry.id]?.at ?? entry.updatedAt;
    if (!sorting) return [...filtered].sort((a, b) => lastUsed(b) - lastUsed(a));
    switch (tab) {
      case "az":
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      case "weak":
        return filtered.filter((entry) => isWeak(entry.password));
      case "recent":
        return [...filtered].sort((a, b) => lastUsed(b) - lastUsed(a));
    }
  }, [passwords, query, sorting, tab, usage]);

  return {
    status,
    total: passwords.length,
    visible,
    query,
    setQuery,
    filtering: query.trim() !== "",
    sorting,
    openSort: () => {
      void navigate(ROUTES.passwords, { replace: true, state: { sort: true } });
    },
    tab,
    setTab,
    lastUsedAt: (entry: PasswordEntry): number | null => usage[entry.id]?.at ?? null,
    isRevealed: (id: string) => revealed.has(id),
    toggleReveal: (entry: PasswordEntry) => {
      setRevealed((current) => {
        const next = new Set(current);
        if (next.has(entry.id)) next.delete(entry.id);
        else next.add(entry.id);
        return next;
      });
      touch(entry.id, EntryKind.Password);
    },
    copyPassword: (entry: PasswordEntry) => {
      touch(entry.id, EntryKind.Password);
      return copy(entry.password, "Password");
    },
    opened: (entry: PasswordEntry) => {
      touch(entry.id, EntryKind.Password);
    },
    /** Empty-state action: ask the Pi for a backup (sync pulls it down). */
    restore: async () => {
      toast.info("Checking your Pi for a backup…");
      await syncNow();
    },
    openId: state.open,
  };
}
