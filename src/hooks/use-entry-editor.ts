import { useAuthRequest } from "@/hooks/use-auth-request";
import { useEntryForm } from "@/hooks/use-entry-form";
import { useVault } from "@/hooks/use-vault";
import type { EntryKind } from "@/enums/vault.enum";
import type { VaultEntry } from "@/types/vault.types";

/** Create (entry is null) or edit: validates, encrypts and saves through the vault, then reports back. */
export function useEntryEditor(entry: VaultEntry | null, onSaved: () => void, kind?: EntryKind) {
  const { add, edit } = useVault();
  const form = useEntryForm(entry, kind);
  const request = useAuthRequest();

  const submit = async () => {
    if (!form.valid || request.pending) return;
    const saved = await request.run(() => (entry ? edit(entry.id, form.input) : add(form.input)));
    if (saved) onSaved();
  };

  return { form, submit, pending: request.pending, error: request.error };
}
