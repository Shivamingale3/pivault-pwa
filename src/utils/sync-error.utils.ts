import { ApiErrorKind } from "@/enums/api.enum";
import { ApiError } from "@/services/api.error";

/** No connection (or the request never finished): changes wait on this device. */
export const isOfflineError = (error: unknown): boolean =>
  !navigator.onLine ||
  (error instanceof ApiError &&
    (error.kind === ApiErrorKind.Network || error.kind === ApiErrorKind.Timeout));

/** The server no longer knows this session (signed in on another device, or it expired). */
export const isSessionEnded = (error: unknown): boolean =>
  error instanceof ApiError && error.kind === ApiErrorKind.Http && error.status === 401;
