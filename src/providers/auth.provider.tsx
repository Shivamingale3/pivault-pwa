import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AuthContext } from "@/contexts/auth.context";
import { AuthStatus } from "@/enums/auth.enum";
import type { AuthContextValue } from "@/interfaces/auth.interface";
import { resolveStoredStatus, signOut } from "@/services/auth.service";
import { clearUnlockedKey } from "@/services/secure-memory.service";
import { errorMessage } from "@/utils/error-message.utils";

interface AuthProviderProps {
  children: ReactNode;
  /** Skips reading the stored session (tests, previews). */
  initialStatus?: AuthStatus;
}

/**
 * Holds the auth state machine: logged-out -> needs-setup -> locked -> unlocked.
 * On start it reads the saved session from this device to decide where the user belongs.
 */
export function AuthProvider({ children, initialStatus }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>(initialStatus ?? AuthStatus.LoggedOut);
  const [ready, setReady] = useState(initialStatus !== undefined);

  useEffect(() => {
    if (initialStatus !== undefined) return;
    let cancelled = false;
    void resolveStoredStatus().then((resolved) => {
      if (cancelled) return;
      setStatus(resolved.status);
      setReady(true);
      if (resolved.error) toast.error(resolved.error);
    });
    return () => {
      cancelled = true;
    };
  }, [initialStatus]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      ready,
      signIn: (session) => {
        setStatus(session.setupDone ? AuthStatus.Locked : AuthStatus.NeedsSetup);
        setReady(true);
      },
      completeSetup: () => {
        setStatus(AuthStatus.Unlocked);
      },
      unlock: () => {
        setStatus(AuthStatus.Unlocked);
      },
      lock: () => {
        clearUnlockedKey();
        // Only an unlocked app can lock: a stray call must not move a signed-out or half-set-up one.
        setStatus((current) => (current === AuthStatus.Unlocked ? AuthStatus.Locked : current));
      },
      signOut: () => {
        setStatus(AuthStatus.LoggedOut);
        signOut().catch((error: unknown) => {
          toast.error(errorMessage(error));
        });
      },
    }),
    [status, ready],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
