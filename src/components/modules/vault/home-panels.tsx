import { NoteRow } from "@/components/modules/vault/note-row";
import { NotesEmpty } from "@/components/modules/vault/notes-empty";
import { PasswordRow } from "@/components/modules/vault/password-row";
import { PasswordsEmpty } from "@/components/modules/vault/passwords-empty";
import { VaultLoading } from "@/components/modules/vault/vault-loading";
import type { useNoteList } from "@/hooks/use-note-list";
import type { usePasswordList } from "@/hooks/use-password-list";

/** Every note, newest first, or the "no notes yet" state. */
export function NotesPanel({ screen }: { screen: ReturnType<typeof useNoteList> }) {
  if (screen.status === "loading") return <VaultLoading />;
  if (screen.total === 0) return <NotesEmpty onWrite={screen.write} />;
  return (
    <ul aria-label="Notes" className="flex flex-col">
      {screen.visible.map((note) => (
        <NoteRow key={note.id} entry={note} onOpen={screen.open} />
      ))}
    </ul>
  );
}

/** Every password, last used first, hidden until revealed, or the "no passwords yet" state. */
export function PasswordsPanel({ screen }: { screen: ReturnType<typeof usePasswordList> }) {
  if (screen.status === "loading") return <VaultLoading />;
  if (screen.total === 0)
    return <PasswordsEmpty onAdd={screen.add} onRestore={() => void screen.restore()} />;
  return (
    <ul aria-label="Passwords" className="flex flex-col">
      {screen.visible.map((entry) => (
        <PasswordRow
          key={entry.id}
          entry={entry}
          revealed={screen.isRevealed(entry.id)}
          onOpen={screen.open}
          onToggleReveal={screen.toggleReveal}
          onCopy={(picked) => void screen.copyPassword(picked)}
        />
      ))}
    </ul>
  );
}
