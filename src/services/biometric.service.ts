import { BIOMETRIC_MESSAGES } from "@/constants/auth.constants";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import { CryptoError } from "@/services/crypto.error";
import { base64UrlToBytes, bytesToBase64Url } from "@/utils/bytes.utils";

const CHALLENGE_BYTES = 32;
const ENROLL_TIMEOUT_MS = 60_000;
const FLAGS_OFFSET = 32;
const USER_VERIFIED_FLAG = 0x04;
/** ES256 and RS256, what platform authenticators offer. */
const ALGORITHMS = [-7, -257] as const;

/** True when this device has a built-in biometric / screen-lock authenticator. Never throws. */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    return (
      typeof PublicKeyCredential !== "undefined" &&
      (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    );
  } catch {
    return false;
  }
}

/**
 * Registers a platform credential that requires user verification (fingerprint, face, device
 * unlock). Returns its id (base64url) for the lock screen's prompt. Throws `CryptoError` when
 * the user cancels or the device refuses; the PIN keeps working either way.
 */
export async function enrollBiometric(user: { userId: string; email: string }): Promise<string> {
  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(CHALLENGE_BYTES)),
        rp: { name: "PiVault" },
        user: {
          id: new TextEncoder().encode(user.userId),
          name: user.email,
          displayName: user.email,
        },
        pubKeyCredParams: ALGORITHMS.map((alg) => ({ type: "public-key", alg })),
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "discouraged",
        },
        timeout: ENROLL_TIMEOUT_MS,
      },
    });
    if (!(credential instanceof PublicKeyCredential)) throw new Error("No credential returned");
    return bytesToBase64Url(new Uint8Array(credential.rawId));
  } catch (error) {
    throw new CryptoError(CryptoErrorKind.Failed, BIOMETRIC_MESSAGES.failed, error);
  }
}

/**
 * Asks the device to verify the user (fingerprint, face or device unlock) with the credential made
 * at setup. True only when the device confirms; a cancel or any failure is false (use the PIN).
 * This is a convenience gate like the PIN: the vault key stays non-extractable either way.
 */
export async function verifyBiometric(credentialId: string): Promise<boolean> {
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(CHALLENGE_BYTES)),
        allowCredentials: [
          { type: "public-key", id: base64UrlToBytes(credentialId), transports: ["internal"] },
        ],
        userVerification: "required",
        timeout: ENROLL_TIMEOUT_MS,
      },
    });
    if (!(assertion instanceof PublicKeyCredential)) return false;
    if (!(assertion.response instanceof AuthenticatorAssertionResponse)) return false;
    // Byte 32 of the authenticator data holds the flags; the device must say it verified the user.
    const flags = new Uint8Array(assertion.response.authenticatorData)[FLAGS_OFFSET] ?? 0;
    return (flags & USER_VERIFIED_FLAG) !== 0;
  } catch {
    return false;
  }
}
