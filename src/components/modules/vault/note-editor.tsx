import { Trash2Icon } from "lucide-react";
import { useRef } from "react";
import { useLocation } from "react-router";
import { ScreenHeader } from "@/components/modules/kit/screen-header";
import { DeleteEntryDialog } from "@/components/modules/vault/delete-entry-dialog";
import { NoteToolbar } from "@/components/modules/vault/note-toolbar";
import { SaveChip } from "@/components/modules/vault/save-chip";
import { Button } from "@/components/ui/button";
import { CRUD_COPY, NOTE_FONT_CLASS } from "@/constants/vault-design.constants";
import { ENTRY_LIMITS } from "@/constants/vault.constants";
import { EntryKind } from "@/enums/vault.enum";
import { useNoteFontSize } from "@/hooks/use-note-font-size";
import { useNoteEditor } from "@/hooks/use-note-editor";
import { useBack } from "@/hooks/use-back";
import { cn } from "@/lib/utils";
import { ROUTES, entryPath } from "@/routes/route-paths";
import type { NoteEntry } from "@/types/vault.types";

/** The note editor: a borderless title and body, a formatting row, and no Save button. */
export function NoteEditor({ entry }: { entry: NoteEntry | null }) {
  const editor = useNoteEditor(entry);
  const back = useBack();
  const fromView = (useLocation().state as { fromView?: boolean } | null)?.fromView === true;
  const area = useRef<HTMLTextAreaElement>(null);
  const { id } = editor.save;
  const { size } = useNoteFontSize();

  return (
    // Exactly one screen tall (shrinks with the keyboard): header, title and toolbar keep their
    // height, the body takes the rest and scrolls inside itself.
    <main className="flex h-dvh justify-center overflow-hidden bg-background">
      <div className="flex min-h-0 w-full max-w-md flex-col gap-4 px-5.5 pt-[max(--spacing(9.5),env(safe-area-inset-top))] pb-[max(--spacing(4),env(safe-area-inset-bottom))]">
        <ScreenHeader backTo={entry ? entryPath.note(entry.id) : ROUTES.notes}>
          <SaveChip status={editor.status} id={id} />
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
          className="shrink-0 bg-transparent text-[1.4375rem] font-extrabold tracking-tight outline-none placeholder:text-subtle"
          onChange={(event) => {
            editor.setTitle(event.target.value);
          }}
        />
        <NoteToolbar
          onFormat={(format) => {
            editor.format(format, area.current);
          }}
          onUndo={editor.undo}
          canUndo={editor.canUndo}
        />
        <textarea
          ref={area}
          aria-label={CRUD_COPY.noteBody}
          placeholder={CRUD_COPY.noteBody}
          value={editor.body}
          maxLength={ENTRY_LIMITS.body}
          className={cn(
            "min-h-0 flex-1 resize-none overflow-y-auto bg-transparent leading-[1.55] font-medium outline-none placeholder:text-subtle",
            NOTE_FONT_CLASS[size],
          )}
          onChange={(event) => {
            editor.type(event.target.value);
          }}
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
          // Opened from the item's screen: skip past it too, the item is gone.
          onDeleted={() => {
            back(ROUTES.notes, fromView ? 2 : 1);
          }}
        />
      )}
    </main>
  );
}
