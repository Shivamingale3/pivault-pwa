import { LOCK_MESSAGES } from "@/constants/lock.constants";
import { StorageErrorKind } from "@/enums/storage.enum";
import type { PinResult } from "@/interfaces/app-lock.interface";
import { getBiometricCredentialId, verifyPin } from "@/services/app-lock.service";
import { verifyBiometric } from "@/services/biometric.service";
import { loadPendingVaultKey, loadVaultKey } from "@/services/key-store.service";
import { setUnlockedKey } from "@/services/secure-memory.service";
import { StorageError } from "@/services/storage.error";

/** Puts the saved vault key into memory. A missing key means this device must sign in again. */
async function openVault(): Promise<void> {
  const key = await loadVaultKey();
  if (!key) throw new StorageError(StorageErrorKind.Corrupted, LOCK_MESSAGES.vaultKeyMissing);
  // A recovery-key replacement that hasn't finished: the new key writes, the old one still opens.
  const pending = await loadPendingVaultKey().catch(() => null);
  if (pending) setUnlockedKey(pending, key);
  else setUnlockedKey(key);
}

/** Checks the PIN (counting wrong guesses) and, when right, unlocks the vault in memory. */
export async function unlockWithPin(pin: string): Promise<PinResult> {
  const result = await verifyPin(pin);
  if (result.ok) await openVault();
  return result;
}

/** True when the device confirmed the user and the vault is now unlocked in memory. */
export async function unlockWithBiometric(): Promise<boolean> {
  const credentialId = await getBiometricCredentialId();
  if (!credentialId || !(await verifyBiometric(credentialId))) return false;
  await openVault();
  return true;
}
