import {
  CRYPTO_ERROR_MESSAGES,
  RECOVERY_KEY_GROUP_SIZE,
  RECOVERY_KEY_HEX_LENGTH,
} from "@/constants/crypto.constants";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import { CryptoError } from "@/services/crypto.error";

const HEX_PATTERN = /^[0-9a-f]+$/;

/** 64 hex characters -> `xxxxxxxx-xxxxxxxx-...` (8 groups of 8) for display. */
export const formatRecoveryKey = (hex: string): string =>
  hex.match(new RegExp(`.{1,${RECOVERY_KEY_GROUP_SIZE}}`, "g"))?.join("-") ?? hex;

/**
 * Accepts what a user types or pastes (hyphens, spaces, any case) and returns the 64 lowercase
 * hex characters. Throws `CryptoError` when it isn't a valid recovery key.
 */
export const parseRecoveryKey = (input: string): string => {
  const hex = input.replace(/[\s-]/g, "").toLowerCase();
  if (hex.length !== RECOVERY_KEY_HEX_LENGTH || !HEX_PATTERN.test(hex)) {
    throw new CryptoError(
      CryptoErrorKind.InvalidRecoveryKey,
      CRYPTO_ERROR_MESSAGES.invalidRecoveryKey,
    );
  }
  return hex;
};
