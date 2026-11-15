import { useState } from "react";
import { useVault } from "@/hooks/use-vault";
import type { VaultEntry } from "@/types/vault.types";

type Overlay =
  { type: "none" } | { type: "create" } | { type: "detail" | "edit" | "delete"; id: string };

/**
 * Which sheet is open on the vault screen. Overlays remember an id, not the entry, so a sheet
 * always shows the latest saved version and closes by itself if its entry disappears.
 */
export function useVaultScreen() {
  const { entries } = useVault();
  const [overlay, setOverlay] = useState<Overlay>({ type: "none" });

  const target: VaultEntry | null =
    overlay.type === "none" || overlay.type === "create"
      ? null
      : (entries.find((entry) => entry.id === overlay.id) ?? null);
  const open = overlay.type === "create" || target !== null ? overlay.type : "none";

  return {
    open,
    target,
    create: () => {
      setOverlay({ type: "create" });
    },
    show: (id: string) => {
      setOverlay({ type: "detail", id });
    },
    edit: (id: string) => {
      setOverlay({ type: "edit", id });
    },
    confirmDelete: (id: string) => {
      setOverlay({ type: "delete", id });
    },
    close: () => {
      setOverlay({ type: "none" });
    },
  };
}
