import type { CryptoErrorKind } from "@/enums/crypto.enum";

/** `message` is always safe to show to the user and never contains key or vault details. */
export class CryptoError extends Error {
  readonly kind: CryptoErrorKind;

  constructor(kind: CryptoErrorKind, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "CryptoError";
    this.kind = kind;
  }
}
