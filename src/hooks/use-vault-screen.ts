import { useState } from "react";
import type { EntryKind } from "@/enums/vault.enum";
import { useVault } from "@/hooks/use-vault";
import type { VaultEntry } from "@/types/vault.types";

type Overlay =
  | { type: "none" }
  | { type: "create"; kind?: EntryKind }
  | { type: "detail" | "edit" | "delete"; id: string };

/**
 * Which sheet is open on the vault screen. Overlays remember an id, not the entry, so a sheet
 * always shows the latest saved version and closes by itself if its entry disappears.
 */
/** `openId` opens that entry's details straight away (from a recently opened row). */
export function useVaultScreen(openId?: string) {
  const { entries } = useVault();
  const [overlay, setOverlay] = useState<Overlay>(
    openId ? { type: "detail", id: openId } : { type: "none" },
  );

  const target: VaultEntry | null =
    overlay.type === "none" || overlay.type === "create"
      ? null
      : (entries.find((entry) => entry.id === overlay.id) ?? null);
  const open = overlay.type === "create" || target !== null ? overlay.type : "none";

  return {
    open,
    target,
    createKind: overlay.type === "create" ? overlay.kind : undefined,
    create: (kind?: EntryKind) => {
      setOverlay({ type: "create", kind });
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
