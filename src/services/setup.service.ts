import { enrollBiometric } from "@/services/biometric.service";
import { markRecoveryKeyConfigured } from "@/services/auth.service";
import { setBiometric, setPin } from "@/services/app-lock.service";
import { importRecoveryKey } from "@/services/crypto.service";
import { saveVaultKey } from "@/services/key-store.service";
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
 * Returning user on a new device: the typed recovery key is kept as is. It can't be checked
 * against the vault until the vault exists, so the first vault download must verify it.
 */
export async function finishSetupWithEnteredKey(input: string): Promise<void> {
  await adoptRecoveryKey(await importRecoveryKey(input));
}
