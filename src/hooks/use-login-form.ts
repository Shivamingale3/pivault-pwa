import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useCountdown } from "@/hooks/use-countdown";
import { type LoginLock, parseLoginLock } from "@/schemas/lockout.schema";
import { isValidEmail } from "@/schemas/auth.schema";
import type { SessionRecord } from "@/schemas/session.schema";
import { ApiError } from "@/services/api.error";
import { login } from "@/services/auth.service";

/**
 * State, validation and submit for the login screen. The email is judged on blur, typing clears the
 * error, a lockout (429 with its wait) switches to the paused view with a live countdown, and a
 * successful sign in shows the "Signed in" confirmation before the app moves on.
 */
export function useLoginForm() {
  const { signIn } = useAuth();
  const request = useAuthRequest();
  const [email, setEmailState] = useState("");
  const [password, setPasswordState] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [lock, setLock] = useState<LoginLock | null>(null);
  const [lockEndsAt, setLockEndsAt] = useState<number | null>(null);
  const [session, setSession] = useState<SessionRecord | null>(null);

  const remainingMs = useCountdown(lockEndsAt, () => {
    setLock(null);
    setLockEndsAt(null);
  });

  const emailOk = isValidEmail(email);
  const valid = emailOk && password.length > 0;

  const submit = async () => {
    if (!valid || request.pending) return;
    const result = await request.run(async (signal) => {
      try {
        return await login(email, password, signal);
      } catch (error) {
        const locked = error instanceof ApiError ? parseLoginLock(error.data) : null;
        if (!locked) throw error;
        setLock(locked);
        setLockEndsAt(Date.now() + locked.retryAfterSeconds * 1000);
        setPasswordState("");
        return undefined;
      }
    });
    if (result) setSession(result);
  };

  return {
    email,
    setEmail: (value: string) => {
      setEmailState(value);
      request.clearError();
    },
    password,
    setPassword: (value: string) => {
      setPasswordState(value);
      request.clearError();
    },
    emailValid: emailOk,
    emailInvalid: emailTouched && email.length > 0 && !emailOk,
    touchEmail: () => {
      setEmailTouched(true);
    },
    valid,
    submit,
    pending: request.pending,
    error: request.error,
    lock,
    remainingMs,
    /** Set once the server accepted the login; the screen shows "Signed in" then calls `finish`. */
    signedIn: session !== null,
    finish: () => {
      if (session) signIn(session);
    },
  };
}
