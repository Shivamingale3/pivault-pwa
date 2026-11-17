import { Navigate } from "react-router";
import { ScreenHeader } from "@/components/modules/kit/screen-header";
import { StatusChip } from "@/components/modules/kit/status-chip";
import { DetailActions } from "@/components/modules/vault/detail-actions";
import { DetailOverlays } from "@/components/modules/vault/detail-overlays";
import { MarkdownView } from "@/components/modules/vault/markdown-view";
import { VaultLoading } from "@/components/modules/vault/vault-loading";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import { EntryKind } from "@/enums/vault.enum";
import { useEntryDetail } from "@/hooks/use-entry-detail";
import { useEntryRoute } from "@/hooks/use-entry-route";
import { useNoteChecklist } from "@/hooks/use-note-checklist";
import { ROUTES, entryPath } from "@/routes/route-paths";
import { wordCount } from "@/utils/markdown.utils";
import { formatOpened } from "@/utils/time.utils";

/** A note, rendered. Checkboxes can be ticked right here; the tick is saved like any other edit. */
export function NoteReadPage() {
  const { entry, loading, missing } = useEntryRoute(EntryKind.Note);
  const detail = useEntryDetail(entry?.id, EntryKind.Note);
  const toggle = useNoteChecklist(entry);
  if (missing) return <Navigate to={ROUTES.notes} replace />;

  return (
    <main className="flex flex-1 justify-center bg-background">
      <div className="flex w-full max-w-md flex-col gap-5 px-5.5 pt-[max(--spacing(9.5),env(safe-area-inset-top))] pb-[max(--spacing(6.5),env(safe-area-inset-bottom))]">
        <ScreenHeader backTo={ROUTES.notes}>
          {entry && (
            <DetailActions editTo={entryPath.noteEdit(entry.id)} onMore={detail.openActions} />
          )}
        </ScreenHeader>
        {loading || !entry ? (
          <VaultLoading />
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[1.4375rem] font-extrabold tracking-tight wrap-break-word">
                {entry.title}
              </h1>
              <p className="text-xs font-medium text-muted-foreground">
                {CRUD_COPY.updated(formatOpened(entry.updatedAt), wordCount(entry.body))}
              </p>
            </div>
            <MarkdownView source={entry.body} onToggle={toggle} />
            <div className="mt-auto pt-2">
              <StatusChip wide>{CRUD_COPY.bodyEncrypted}</StatusChip>
            </div>
            <DetailOverlays entry={entry} detail={detail} listPath={ROUTES.notes} />
          </>
        )}
      </div>
    </main>
  );
}
