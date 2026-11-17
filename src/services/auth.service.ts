import { removeVaultDb } from "@/db/vault.db";
import { emptyResponseSchema, loginResponseSchema } from "@/schemas/auth.schema";
import type { SessionRecord } from "@/schemas/session.schema";
import { postJson } from "@/services/api.client";
import { exportPublicKey, generateLoginKeyPair } from "@/services/crypto.service";
import { clearUsage } from "@/services/usage.service";
import { clearSyncStats } from "@/services/sync-stats.service";
import { clearAppLock } from "@/services/app-lock.service";
import { postSigned } from "@/services/signed-api.client";
import { clearLoginKeyPair, clearVaultKey, saveLoginKeyPair } from "@/services/key-store.service";
import { clearUnlockedKey } from "@/services/secure-memory.service";
import { clearSession, loadSession, saveSession } from "@/services/session.service";
import { LOCK_MESSAGES } from "@/constants/lock.constants";
import { AuthStatus } from "@/enums/auth.enum";
import { errorMessage } from "@/utils/error-message.utils";

/** The sign-out wipe in progress, if any. */
let wiping: Promise<void> = Promise.resolve();

/**
 * Signs in: makes a fresh device key pair (private key non-extractable), sends only the public
 * key with the credentials, and keeps the key pair and session on this device once the server
 * accepts. Nothing is stored when the server refuses. A new login replaces the old session.
 */
export async function login(
  email: string,
  password: string,
  signal?: AbortSignal,
): Promise<SessionRecord> {
  // A sign out may still be wiping this device: let it finish, or it would delete the new session.
  await wiping;
  const pair = await generateLoginKeyPair();
  const publicKey = await exportPublicKey(pair.publicKey);
  const data = await postJson(
    "/auth/login",
    { email: email.trim(), password, publicKey },
    loginResponseSchema,
    { signal },
  );
  const session: SessionRecord = {
    userId: data.user.id,
    email: data.user.email,
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    token: data.token,
    expiresAt: data.expiresAt,
    recoveryKeyConfigured: data.recoveryKeyConfigured,
    setupDone: false,
  };
  await saveLoginKeyPair(pair);
  await saveSession(session);
  return session;
}

/** Asks the server to email a reset link. The server says so when the email is unknown. */
export const requestPasswordReset = async (email: string, signal?: AbortSignal): Promise<void> => {
  await postJson("/auth/forgot-password", { email: email.trim() }, emptyResponseSchema, {
    signal,
  });
};

/** Tells the server this device generated its recovery key (the key itself never leaves the device). */
export const markRecoveryKeyConfigured = async (signal?: AbortSignal): Promise<void> => {
  await postSigned("/auth/recovery-key-configured", {}, emptyResponseSchema, { signal });
};

/**
 * Signs out. The server session is ended first on a best-effort basis (sign out must work
 * offline), then EVERYTHING on this device goes: session, device key, vault key, PIN and every saved item. The next
 * login here starts from scratch (and asks for the recovery key), so a shared device never leaks
 * one account's key to the next.
 */
export function signOut(): Promise<void> {
  const done = (async () => {
    await postSigned("/auth/logout", {}, emptyResponseSchema).catch(() => undefined);
    await wipeDevice();
  })();
  wiping = done.catch(() => undefined);
  return done;
}

/** Removes the session, keys, PIN and every saved item from this device, and locks memory. */
export async function wipeDevice(): Promise<void> {
  clearUnlockedKey();
  // Every step is attempted even when one fails, so a single error can't leave the rest behind.
  const results = await Promise.allSettled([
    clearSession(),
    clearLoginKeyPair(),
    clearVaultKey(),
    clearAppLock(),
    removeVaultDb(),
    clearSyncStats(),
    clearUsage(),
  ]);
  const failure = results.find((result) => result.status === "rejected");
  if (failure) throw failure.reason;
}

/** Where the app should start: logged out, set up, or locked. Never throws. */
export async function resolveStoredStatus(): Promise<{ status: AuthStatus; error?: string }> {
  try {
    const session = await loadSession();
    if (!session) return { status: AuthStatus.LoggedOut };
    if (Date.parse(session.expiresAt) <= Date.now()) {
      // The server dropped this session already: nothing on the device is worth keeping.
      await wipeDevice();
      return { status: AuthStatus.LoggedOut, error: LOCK_MESSAGES.sessionExpired };
    }
    return { status: session.setupDone ? AuthStatus.Locked : AuthStatus.NeedsSetup };
  } catch (error) {
    return { status: AuthStatus.LoggedOut, error: errorMessage(error) };
  }
}
