import { useAuthRequest } from "@/hooks/use-auth-request";
import { useVault } from "@/hooks/use-vault";

interface DeleteHooks {
  /** Runs first and is waited for (an editor pauses its autosave so it can't write the entry back). */
  before?: () => Promise<void>;
  /** The delete failed: undo whatever `before` did. */
  failed?: () => void;
}

/** Deletes one entry from this device (and from the server at the next sync). */
export function useDeleteEntry(id: string, onDeleted: () => void, hooks: DeleteHooks = {}) {
  const { remove } = useVault();
  const request = useAuthRequest();

  const confirm = async () => {
    const done = await request.run(async () => {
      try {
        await hooks.before?.();
        await remove(id);
        return true;
      } catch (error) {
        hooks.failed?.();
        throw error;
      }
    });
    if (done) onDeleted();
  };

  return { confirm, pending: request.pending, error: request.error };
}
