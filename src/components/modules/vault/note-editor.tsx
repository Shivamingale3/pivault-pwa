import { Trash2Icon } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router";
import { ScreenHeader } from "@/components/modules/kit/screen-header";
import { DeleteEntryDialog } from "@/components/modules/vault/delete-entry-dialog";
import { NoteToolbar } from "@/components/modules/vault/note-toolbar";
import { SaveChip } from "@/components/modules/vault/save-chip";
import { Button } from "@/components/ui/button";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import { ENTRY_LIMITS } from "@/constants/vault.constants";
import { EntryKind } from "@/enums/vault.enum";
import { useAutoGrow } from "@/hooks/use-auto-grow";
import { useNoteEditor } from "@/hooks/use-note-editor";
import { ROUTES, entryPath } from "@/routes/route-paths";
import type { NoteEntry } from "@/types/vault.types";

/** The note editor: a borderless title and body, a formatting row, and no Save button. */
export function NoteEditor({ entry }: { entry: NoteEntry | null }) {
  const editor = useNoteEditor(entry);
  const navigate = useNavigate();
  const area = useRef<HTMLTextAreaElement>(null);
  const { id } = editor.save;
  useAutoGrow(area, editor.body);

  return (
    <main className="flex flex-1 justify-center bg-background">
      <div className="flex w-full max-w-md flex-col gap-4 px-5.5 pt-[max(--spacing(9.5),env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)]">
        <ScreenHeader backTo={entry ? entryPath.note(entry.id) : ROUTES.notes}>
          <SaveChip status={editor.status} saved={CRUD_COPY.noteSaved} />
          {id && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={CRUD_COPY.deleteNote}
              onClick={() => {
                editor.setDeleting(true);
              }}
            >
              <Trash2Icon />
            </Button>
          )}
        </ScreenHeader>
        <input
          aria-label={CRUD_COPY.noteTitle}
          placeholder={CRUD_COPY.noteTitle}
          value={editor.title}
          maxLength={ENTRY_LIMITS.title}
          autoFocus={!entry}
          autoComplete="off"
          className="bg-transparent text-[1.4375rem] font-extrabold tracking-tight outline-none placeholder:text-subtle"
          onChange={(event) => {
            editor.setTitle(event.target.value);
          }}
        />
        <textarea
          ref={area}
          aria-label={CRUD_COPY.noteBody}
          placeholder={CRUD_COPY.noteBody}
          value={editor.body}
          maxLength={ENTRY_LIMITS.body}
          // Grows with the text (useAutoGrow) and fills the space when short: the page scrolls, never the box.
          className="min-h-40 grow resize-none overflow-hidden bg-transparent text-[0.9375rem] leading-[1.55] font-medium outline-none placeholder:text-subtle"
          onChange={(event) => {
            editor.type(event.target.value);
          }}
        />
        <NoteToolbar
          onFormat={(format) => {
            editor.format(format, area.current);
          }}
          onUndo={editor.undo}
          canUndo={editor.canUndo}
        />
      </div>
      {editor.deleting && id && (
        <DeleteEntryDialog
          entry={{ id, kind: EntryKind.Note, title: editor.title }}
          onClose={() => {
            editor.setDeleting(false);
          }}
          onBeforeDelete={editor.save.pause}
          onDeleteFailed={editor.save.resume}
          onDeleted={() => void navigate(ROUTES.notes, { replace: true })}
        />
      )}
    </main>
  );
}
