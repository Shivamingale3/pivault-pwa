import { API_ERROR_MESSAGES } from "@/constants/api.constants";
import { CryptoError } from "@/services/crypto.error";
import { ApiError } from "@/services/api.error";
import { StorageError } from "@/services/storage.error";

/** Our errors carry a message that is safe to show; anything else gets a generic one. */
export const errorMessage = (error: unknown): string =>
  error instanceof ApiError || error instanceof CryptoError || error instanceof StorageError
    ? error.message
    : API_ERROR_MESSAGES.fallback;
