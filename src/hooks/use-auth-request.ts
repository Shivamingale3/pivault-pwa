import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiErrorKind } from "@/enums/api.enum";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import { ApiError } from "@/services/api.error";
import { CryptoError } from "@/services/crypto.error";
import { errorMessage } from "@/utils/error-message.utils";

const HTTP_TOO_MANY_REQUESTS = 429;

const isAbort = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

/** A reason the form can show inline: the server's answer (wrong password) or a mistyped recovery key. */
const isFormError = (error: unknown): boolean =>
  (error instanceof ApiError &&
    error.kind === ApiErrorKind.Http &&
    error.status !== HTTP_TOO_MANY_REQUESTS) ||
  (error instanceof CryptoError && error.kind === CryptoErrorKind.InvalidRecoveryKey);

/**
 * Runs one auth call at a time for a form: tracks `pending`, keeps the failure message in `error`
 * (shown inline) and also toasts anything the form can't explain (offline, timeout, too many tries,
 * storage problems). Cancels the call when the screen goes away.
 */
export function useAuthRequest() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );

  const run = useCallback(
    async <T>(task: (signal: AbortSignal) => Promise<T>): Promise<T | undefined> => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      setPending(true);
      setError(null);
      try {
        return await task(current.signal);
      } catch (caught) {
        if (isAbort(caught)) return undefined;
        const message = errorMessage(caught);
        setError(message);
        if (!isFormError(caught)) toast.error(message);
        return undefined;
      } finally {
        if (!current.signal.aborted) setPending(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { pending, error, run, clearError };
}
