import type { ApiErrorKind } from "@/enums/api.enum";

/** Every failure of `postJson` is an `ApiError`; `message` is always safe to show to the user. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status, or null when no response arrived. */
  readonly status: number | null;

  constructor(kind: ApiErrorKind, message: string, status: number | null = null, cause?: unknown) {
    super(message, { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}
