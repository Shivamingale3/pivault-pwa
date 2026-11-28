import { useSearchParams } from "react-router";
import { EntryKind } from "@/enums/vault.enum";
import { useNoteList } from "@/hooks/use-note-list";
import { usePasswordList } from "@/hooks/use-password-list";
import { useSession } from "@/hooks/use-session";
import { HOME_SHOW_PARAM } from "@/routes/route-paths";

const isKind = (value: string | null): value is EntryKind =>
  value === EntryKind.Note || value === EntryKind.Password;

/** Home: which list is shown (Notes by default), both lists, and the name for the avatar. */
export function useHome() {
  const session = useSession();
  const [params, setParams] = useSearchParams();
  const raw = params.get(HOME_SHOW_PARAM);
  const show: EntryKind = isKind(raw) ? raw : EntryKind.Note;

  return {
    show,
    setShow: (next: EntryKind) => {
      setParams(next === EntryKind.Note ? {} : { [HOME_SHOW_PARAM]: next }, { replace: true });
    },
    /** For the avatar: the full name, or the email when there is none. */
    name: `${session?.firstName ?? ""} ${session?.lastName ?? ""}`.trim() || (session?.email ?? ""),
    notes: useNoteList(),
    passwords: usePasswordList(),
  };
}
