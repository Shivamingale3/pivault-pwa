import { OfflinePill } from "@/components/modules/sync/offline-pill";
import { Fab } from "@/components/modules/kit/fab";
import { FilterField } from "@/components/modules/kit/filter-field";
import { ListHeader } from "@/components/modules/vault/list-header";
import { NoteRow } from "@/components/modules/vault/note-row";
import { NotesEmpty } from "@/components/modules/vault/notes-empty";
import { VaultEmpty } from "@/components/modules/vault/vault-empty";
import { VaultLoading } from "@/components/modules/vault/vault-loading";
import { LIST_COPY } from "@/constants/vault-design.constants";
import { useNotesScreen } from "@/hooks/use-notes-screen";

/** Notes: title rows with chevrons, a filter, and a button to write a new one. */
export function NotesPage() {
  const screen = useNotesScreen();
  const write = screen.write;

  const body = () => {
    if (screen.status === "loading") return <VaultLoading />;
    if (screen.total === 0) return <NotesEmpty onWrite={write} />;
    if (screen.visible.length === 0) return <VaultEmpty filtering />;
    return (
      <ul aria-label="Notes" className="flex flex-col">
        {screen.visible.map((note) => (
          <NoteRow key={note.id} entry={note} onOpen={screen.open} />
        ))}
      </ul>
    );
  };

  return (
    <main className="flex flex-1 justify-center bg-background">
      <div className="flex w-full max-w-md flex-col gap-4 px-5.5 pt-[max(--spacing(9.5),env(safe-area-inset-top))] pb-6">
        <ListHeader title={LIST_COPY.notesTitle} meta={LIST_COPY.notesMeta(screen.total)} />
        <OfflinePill />
        <FilterField
          value={screen.query}
          onChange={screen.setQuery}
          placeholder={LIST_COPY.filter}
          label="Filter notes"
        />
        <div className="flex flex-1 flex-col">{body()}</div>
        {screen.status === "ready" && screen.total > 0 && (
          <Fab label={LIST_COPY.addNote} onClick={write} />
        )}
      </div>
    </main>
  );
}
