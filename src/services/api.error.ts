import type { ApiErrorKind } from "@/enums/api.enum";

/** Every failure of `postJson` is an `ApiError`; `message` is always safe to show to the user. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status, or null when no response arrived. */
  readonly status: number | null;
  /** The `data` the server sent with an error (e.g. how long a lockout lasts), or null. */
  readonly data: unknown;

  constructor(
    kind: ApiErrorKind,
    message: string,
    status: number | null = null,
    cause?: unknown,
    data: unknown = null,
  ) {
    super(message, { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.data = data;
  }
}
