import type { StorageErrorKind } from "@/enums/storage.enum";

/** `message` is always safe to show to the user. */
export class StorageError extends Error {
  readonly kind: StorageErrorKind;

  constructor(kind: StorageErrorKind, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "StorageError";
    this.kind = kind;
  }
}
