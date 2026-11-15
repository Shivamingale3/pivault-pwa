import { useEffect, useState } from "react";
import type { SessionRecord } from "@/schemas/session.schema";
import { loadSession } from "@/services/session.service";

/** The signed-in account from this device, or null until it is read. */
export function useSession(): SessionRecord | null {
  const [session, setSession] = useState<SessionRecord | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadSession()
      .then((loaded) => {
        if (!cancelled) setSession(loaded);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return session;
}
