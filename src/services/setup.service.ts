import { enrollBiometric } from "@/services/biometric.service";
import { markRecoveryKeyConfigured } from "@/services/auth.service";
import { setBiometric, setPin } from "@/services/app-lock.service";
import { KEY_CHECK_SAMPLE, SYNC_MESSAGES } from "@/constants/sync.constants";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import { entryPayloadSchema } from "@/schemas/vault.schema";
import { CryptoError } from "@/services/crypto.error";
import { decryptJson, importRecoveryKey } from "@/services/crypto.service";
import { pullChanges } from "@/services/sync.api";
import { entryAad } from "@/utils/vault.utils";
import { loadVaultKey, saveVaultKey } from "@/services/key-store.service";
import { LOCK_MESSAGES } from "@/constants/lock.constants";
import { StorageErrorKind } from "@/enums/storage.enum";
import { StorageError } from "@/services/storage.error";
import { setUnlockedKey } from "@/services/secure-memory.service";
import { loadSession, markSetupDone } from "@/services/session.service";

/**
 * Saves the PIN and, when asked, enrolls biometric unlock. A biometric problem never blocks
 * setup: the PIN is already saved, so the result tells the screen to explain and carry on.
 */
export async function configureAppLock(
  pin: string,
  withBiometric: boolean,
): Promise<{ biometricFailed: boolean }> {
  await setPin(pin);
  if (!withBiometric) return { biometricFailed: false };
  try {
    const session = await loadSession();
    if (!session) throw new Error("No session");
    await setBiometric(await enrollBiometric(session));
    return { biometricFailed: false };
  } catch {
    return { biometricFailed: true };
  }
}

/** Keeps the key on this device, marks setup done and unlocks the vault in memory. */
async function adoptRecoveryKey(key: CryptoKey): Promise<void> {
  await saveVaultKey(key);
  await markSetupDone();
  setUnlockedKey(key);
}

/**
 * First login: the user saved the freshly generated recovery key. The server is told first, so
 * if it can't be reached nothing is stored and the user can simply try again.
 */
export async function finishSetupWithNewKey(recoveryKey: string, signal?: AbortSignal) {
  const key = await importRecoveryKey(recoveryKey);
  await markRecoveryKeyConfigured(signal);
  await adoptRecoveryKey(key);
}

/**
 * A typed recovery key must open the vault that is already on the server: the first few entries
 * are pulled and at least one has to decrypt. An empty vault accepts any well-formed key. Needs a
 * connection; offline, the error says so and nothing is stored.
 */
async function verifyAgainstServer(key: CryptoKey): Promise<void> {
  const { documents } = await pullChanges(null, KEY_CHECK_SAMPLE);
  if (documents.length === 0) return;
  const opened = await Promise.all(
    documents.map((document) =>
      decryptJson(key, document.envelope, entryPayloadSchema, entryAad(document.id)).then(
        () => true,
        () => false,
      ),
    ),
  );
  if (!opened.some(Boolean)) {
    throw new CryptoError(CryptoErrorKind.InvalidRecoveryKey, SYNC_MESSAGES.keyMismatch);
  }
}

/**
 * New phone: the typed recovery key is checked against the server's vault (see `verifyAgainstServer`)
 * and, if it opens it, kept on this device. Setup is not finished yet: the vault is rebuilt and a
 * PIN set first.
 */
export async function recoverVaultKey(input: string): Promise<void> {
  const key = await importRecoveryKey(input);
  await verifyAgainstServer(key);
  await saveVaultKey(key);
}

/** New phone, last step: the PIN is set and the vault is down, so mark setup done and unlock. */
export async function finishRecoveredSetup(): Promise<void> {
  const key = await loadVaultKey();
  if (!key) throw new StorageError(StorageErrorKind.Corrupted, LOCK_MESSAGES.vaultKeyMissing);
  await markSetupDone();
  setUnlockedKey(key);
}
