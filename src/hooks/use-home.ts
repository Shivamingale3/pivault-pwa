import { useSearchParams } from "react-router";
import { EntryKind } from "@/enums/vault.enum";
import { useNotesScreen } from "@/hooks/use-notes-screen";
import { usePasswordsScreen } from "@/hooks/use-passwords-screen";
import { useSession } from "@/hooks/use-session";

/** The address keeps the picked list (`?show=password`), so coming back to Home shows the same one. */
const SHOW_PARAM = "show";

const isKind = (value: string | null): value is EntryKind =>
  value === EntryKind.Note || value === EntryKind.Password;

/** Home: which list is shown (Notes by default), both lists, and the name for the avatar. */
export function useHome() {
  const session = useSession();
  const [params, setParams] = useSearchParams();
  const raw = params.get(SHOW_PARAM);
  const show: EntryKind = isKind(raw) ? raw : EntryKind.Note;

  return {
    show,
    setShow: (next: EntryKind) => {
      setParams(next === EntryKind.Note ? {} : { [SHOW_PARAM]: next }, { replace: true });
    },
    /** For the avatar: the full name, or the email when there is none. */
    name: `${session?.firstName ?? ""} ${session?.lastName ?? ""}`.trim() || (session?.email ?? ""),
    notes: useNotesScreen(),
    passwords: usePasswordsScreen(),
  };
}
