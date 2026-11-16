import { Navigate, useParams } from "react-router";
import { NoteEditor } from "@/components/modules/vault/note-editor";
import { VaultLoading } from "@/components/modules/vault/vault-loading";
import { EntryKind } from "@/enums/vault.enum";
import { useEntryRoute } from "@/hooks/use-entry-route";
import { ROUTES } from "@/routes/route-paths";

/** A new note. */
export function NoteNewPage() {
  return <NoteEditor entry={null} />;
}

/** Editing a saved note. */
export function NoteEditPage() {
  const { id } = useParams();
  const { entry, loading, missing } = useEntryRoute(EntryKind.Note);
  if (missing) return <Navigate to={ROUTES.notes} replace />;
  if (loading || !entry) return <VaultLoading />;
  return <NoteEditor key={id} entry={entry} />;
}
