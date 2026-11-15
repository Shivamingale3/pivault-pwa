import { useAuthRequest } from "@/hooks/use-auth-request";
import { useVault } from "@/hooks/use-vault";

/** Deletes one entry from this device (and, once sync exists, from the server). */
export function useDeleteEntry(id: string, onDeleted: () => void) {
  const { remove } = useVault();
  const request = useAuthRequest();

  const confirm = async () => {
    const done = await request.run(() => remove(id).then(() => true));
    if (done) onDeleted();
  };

  return { confirm, pending: request.pending, error: request.error };
}
