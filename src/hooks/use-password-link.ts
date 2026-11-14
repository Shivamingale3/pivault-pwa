import { useEffect, useState } from "react";
import { toast } from "sonner";
import { INVALID_LINK_MESSAGE, LINK_TOKEN_PATTERN } from "@/constants/password-link.constants";
import { ApiErrorKind } from "@/enums/api.enum";
import { LinkPhase } from "@/enums/password-link.enum";
import { ApiError } from "@/services/api.error";
import { completeLink, validateLink } from "@/services/password-link.service";
import type { LinkStatus } from "@/types/password-link.types";

const TOO_MANY_ATTEMPTS = "Too many attempts. Wait a minute and try again.";
const HTTP_TOO_MANY_REQUESTS = 429;

const isWellFormed = (token: string | null): token is string =>
  token !== null && LINK_TOKEN_PATTERN.test(token);

const isInvalidLink = (error: unknown): boolean =>
  error instanceof ApiError &&
  error.kind === ApiErrorKind.Http &&
  error.status === 400 &&
  error.message === INVALID_LINK_MESSAGE;

const isAbort = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

/**
 * Drives the emailed-link screen: checks the link, then sets the password and verifies the email
 * in one call. Every failure ends in a state the screen can show (and a toast for transient ones).
 */
export function usePasswordLink(token: string | null) {
  const [phase, setPhase] = useState<LinkPhase>(
    isWellFormed(token) ? LinkPhase.Checking : LinkPhase.Invalid,
  );
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isWellFormed(token)) return;
    const controller = new AbortController();
    validateLink(token, controller.signal)
      .then((result) => {
        setStatus(result);
        setPhase(LinkPhase.Ready);
      })
      .catch((error: unknown) => {
        if (isAbort(error)) return;
        setPhase(isInvalidLink(error) ? LinkPhase.Invalid : LinkPhase.Unavailable);
      });
    return () => {
      controller.abort();
    };
  }, [token, attempt]);

  const retry = () => {
    setPhase(LinkPhase.Checking);
    setAttempt((count) => count + 1);
  };

  const submit = async (password: string): Promise<void> => {
    if (!isWellFormed(token) || phase === LinkPhase.Submitting) return;
    setPhase(LinkPhase.Submitting);
    setSubmitError(null);
    try {
      await completeLink(token, password);
      setPhase(LinkPhase.Success);
    } catch (error) {
      if (isInvalidLink(error)) {
        setPhase(LinkPhase.Invalid);
        return;
      }
      setPhase(LinkPhase.Ready);
      const apiError = error instanceof ApiError ? error : null;
      if (apiError?.status === 400) setSubmitError(apiError.message);
      else
        toast.error(
          apiError?.status === HTTP_TOO_MANY_REQUESTS
            ? TOO_MANY_ATTEMPTS
            : (apiError?.message ?? "Something went wrong. Try again."),
        );
    }
  };

  return { phase, purpose: status?.purpose ?? null, submitError, submit, retry };
}
