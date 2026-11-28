import { Navigate } from "react-router";
import { ScreenHeader } from "@/components/modules/kit/screen-header";
import { DetailActions } from "@/components/modules/vault/detail-actions";
import { DetailOverlays } from "@/components/modules/vault/detail-overlays";
import { SyncChip } from "@/components/modules/vault/sync-mark";
import { MarkdownView } from "@/components/modules/vault/markdown-view";
import { VaultLoading } from "@/components/modules/vault/vault-loading";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import { EntryKind } from "@/enums/vault.enum";
import { useEntryDetail } from "@/hooks/use-entry-detail";
import { useEntryRoute } from "@/hooks/use-entry-route";
import { useNoteChecklist } from "@/hooks/use-note-checklist";
import { entryPath, homeList } from "@/routes/route-paths";
import { formatOpened } from "@/utils/time.utils";

/** A note, rendered. Checkboxes can be ticked right here; the tick is saved like any other edit. */
export function NoteReadPage() {
  const { entry, loading, missing } = useEntryRoute(EntryKind.Note);
  const detail = useEntryDetail(entry?.id, EntryKind.Note);
  const toggle = useNoteChecklist(entry);
  if (missing) return <Navigate to={homeList(EntryKind.Note)} replace />;

  return (
    <main className="flex min-h-full w-full justify-center bg-background">
      <div className="flex w-full max-w-md flex-col gap-5 px-5.5 pt-[max(--spacing(9.5),env(safe-area-inset-top))] pb-[max(--spacing(6.5),env(safe-area-inset-bottom))]">
        <ScreenHeader backTo={homeList(EntryKind.Note)}>
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
                {CRUD_COPY.updated(formatOpened(entry.updatedAt))}
              </p>
            </div>
            <MarkdownView source={entry.body} onToggle={toggle} />
            <div className="mt-auto pt-2">
              <SyncChip id={entry.id} updatedAt={entry.updatedAt} />
            </div>
            <DetailOverlays entry={entry} detail={detail} listPath={homeList(EntryKind.Note)} />
          </>
        )}
      </div>
    </main>
  );
}
