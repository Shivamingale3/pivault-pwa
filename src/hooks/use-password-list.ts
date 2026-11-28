import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useCopy } from "@/hooks/use-copy";
import { useSync } from "@/hooks/use-sync";
import { useUsage } from "@/hooks/use-usage";
import { useVault } from "@/hooks/use-vault";
import { EntryKind } from "@/enums/vault.enum";
import { ROUTES, entryPath } from "@/routes/route-paths";
import type { PasswordEntry } from "@/types/vault.types";

/** Home's password list: last used first, reveal and copy per row. */
export function usePasswordList() {
  const { entries, status } = useVault();
  const { usage, touch } = useUsage();
  const { syncNow } = useSync();
  const copy = useCopy();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());

  const visible = useMemo(() => {
    const lastUsed = (entry: PasswordEntry): number => usage[entry.id]?.at ?? entry.updatedAt;
    return entries
      .filter((entry): entry is PasswordEntry => entry.kind === EntryKind.Password)
      .sort((a, b) => lastUsed(b) - lastUsed(a));
  }, [entries, usage]);

  return {
    status,
    total: visible.length,
    visible,
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
    open: (entry: PasswordEntry) => {
      void navigate(entryPath.password(entry.id));
    },
    add: () => {
      void navigate(ROUTES.passwordNew);
    },
    /** Empty-state action: ask the Pi for a backup (sync pulls it down). */
    restore: async () => {
      toast.info("Checking your Pi for a backup…");
      await syncNow();
    },
  };
}
