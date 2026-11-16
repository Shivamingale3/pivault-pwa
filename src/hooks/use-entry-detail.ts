import { useEffect, useState } from "react";
import type { EntryKind } from "@/enums/vault.enum";
import { useUsage } from "@/hooks/use-usage";

/** A detail screen's state: which overlay is open, and marking the entry as recently opened. */
export function useEntryDetail(id: string | undefined, kind: EntryKind) {
  const { touch } = useUsage();
  const [overlay, setOverlay] = useState<"none" | "actions" | "delete">("none");

  useEffect(() => {
    if (id) touch(id, kind);
  }, [id, kind, touch]);

  return {
    overlay,
    openActions: () => {
      setOverlay("actions");
    },
    askDelete: () => {
      setOverlay("delete");
    },
    close: () => {
      setOverlay("none");
    },
  };
}
