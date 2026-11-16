import { StatusChip } from "@/components/modules/kit/status-chip";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import type { SaveStatus } from "@/hooks/use-autosave";

/** The autosave chip: "Saving…" while a change is pending, then the saved wording. */
export function SaveChip({
  status,
  saved = CRUD_COPY.savedJustNow,
}: {
  status: SaveStatus;
  saved?: string;
}) {
  const text = {
    idle: CRUD_COPY.notSaved,
    saving: CRUD_COPY.saving,
    saved,
    error: CRUD_COPY.saveFailed,
  }[status];
  return <StatusChip busy={status === "saving"}>{text}</StatusChip>;
}
