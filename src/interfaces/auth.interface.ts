import type { AuthStatus } from "@/enums/auth.enum";
import type { SessionRecord } from "@/schemas/session.schema";

export interface AuthContextValue {
  status: AuthStatus;
  /** False until the stored session has been read; guarded screens wait for it. */
  ready: boolean;
  /** Login succeeded (the session is already saved): go to setup, or to the lock screen. */
  signIn: (session: SessionRecord) => void;
  /** App lock + recovery key are done; the app is now unlocked. PLACEHOLDER until setup exists. */
  completeSetup: () => void;
  unlock: () => void;
  lock: () => void;
  signOut: () => void;
}
