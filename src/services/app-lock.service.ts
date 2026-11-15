import {
  APP_LOCK_MESSAGES,
  PBKDF2_ITERATIONS,
  PIN_HASH_BITS,
  PIN_PATTERN,
  PIN_SALT_BYTES,
} from "@/constants/app-lock.constants";
import { RecordId, STORAGE_ERROR_MESSAGES, StoreName } from "@/constants/storage.constants";
import { idbDelete, idbGet, idbPut } from "@/db/idb";
import { StorageErrorKind } from "@/enums/storage.enum";
import type { PinResult } from "@/interfaces/app-lock.interface";
import { type AppLockRecord, appLockRecordSchema } from "@/schemas/app-lock.schema";
import { StorageError } from "@/services/storage.error";
import { base64ToBytes, bytesToBase64, constantTimeEqual } from "@/utils/bytes.utils";
import { attemptsUntilLockout, lockoutDurationMs } from "@/utils/app-lock.utils";

/** Salted PBKDF2-SHA256 of the PIN. The PIN itself is never stored. */
async function hashPin(pin: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    material,
    PIN_HASH_BITS,
  );
  return new Uint8Array(bits);
}

async function loadRecord(): Promise<AppLockRecord | null> {
  const value = await idbGet(StoreName.Auth, RecordId.AppLock);
  if (value === undefined) return null;
  const parsed = appLockRecordSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  await idbDelete(StoreName.Auth, RecordId.AppLock).catch(() => undefined);
  throw new StorageError(StorageErrorKind.Corrupted, STORAGE_ERROR_MESSAGES.corrupted);
}

const saveRecord = (record: AppLockRecord) =>
  idbPut(StoreName.Auth, RecordId.AppLock, appLockRecordSchema.parse(record));

const requireRecord = async (): Promise<AppLockRecord> => {
  const record = await loadRecord();
  if (!record) throw new StorageError(StorageErrorKind.Corrupted, STORAGE_ERROR_MESSAGES.corrupted);
  return record;
};

/** Checks run one at a time so parallel guesses can't dodge the failed-attempt counter. */
let queue: Promise<unknown> = Promise.resolve();
const serialize = <T>(task: () => Promise<T>): Promise<T> => {
  const next = queue.then(task, task);
  queue = next.catch(() => undefined);
  return next;
};

export async function hasPin(): Promise<boolean> {
  return (await loadRecord()) !== null;
}

/** Sets (or changes) the 6 digit PIN. Keeps the biometric choice, resets the attempt counter. */
export async function setPin(pin: string): Promise<void> {
  if (!PIN_PATTERN.test(pin)) throw new RangeError(APP_LOCK_MESSAGES.invalidPin);
  const existing = await loadRecord();
  const salt = crypto.getRandomValues(new Uint8Array(PIN_SALT_BYTES));
  const hash = await hashPin(pin, salt, PBKDF2_ITERATIONS);
  await saveRecord({
    salt: bytesToBase64(salt),
    hash: bytesToBase64(hash),
    iterations: PBKDF2_ITERATIONS,
    failedAttempts: 0,
    lockedUntil: 0,
    biometricEnabled: existing?.biometricEnabled ?? false,
    ...(existing?.credentialId ? { credentialId: existing.credentialId } : {}),
  });
}

/** Checks a PIN. Counts wrong guesses and refuses checks during a lockout. */
export const verifyPin = (pin: string): Promise<PinResult> =>
  serialize(async () => {
    const record = await requireRecord();
    const now = Date.now();
    if (now < record.lockedUntil) {
      return { ok: false, reason: "locked-out", retryAfterMs: record.lockedUntil - now };
    }
    const expected = base64ToBytes(record.hash);
    const actual = await hashPin(pin, base64ToBytes(record.salt), record.iterations);
    if (constantTimeEqual(expected, actual)) {
      await saveRecord({ ...record, failedAttempts: 0, lockedUntil: 0 });
      return { ok: true };
    }
    const failedAttempts = record.failedAttempts + 1;
    const lockout = lockoutDurationMs(failedAttempts);
    await saveRecord({ ...record, failedAttempts, lockedUntil: lockout > 0 ? now + lockout : 0 });
    return lockout > 0
      ? { ok: false, reason: "locked-out", retryAfterMs: lockout }
      : { ok: false, reason: "wrong", attemptsLeft: attemptsUntilLockout(failedAttempts) };
  });

export async function isBiometricEnabled(): Promise<boolean> {
  return (await loadRecord())?.biometricEnabled ?? false;
}

/** Remembers the enrolled biometric credential, or turns biometric unlock off with `null`. */
export async function setBiometric(credentialId: string | null): Promise<void> {
  const { credentialId: _previous, ...rest } = await requireRecord();
  await saveRecord({
    ...rest,
    biometricEnabled: credentialId !== null,
    ...(credentialId === null ? {} : { credentialId }),
  });
}

/** The enrolled credential for the biometric prompt on the lock screen, if any. */
export async function getBiometricCredentialId(): Promise<string | null> {
  return (await loadRecord())?.credentialId ?? null;
}

export const clearAppLock = () => idbDelete(StoreName.Auth, RecordId.AppLock);
