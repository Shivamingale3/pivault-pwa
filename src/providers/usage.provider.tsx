import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { UsageContext, type UsageContextValue } from "@/contexts/usage.context";
import type { EntryKind } from "@/enums/vault.enum";
import type { UsageMap } from "@/schemas/usage.schema";
import { clearUsage, loadUsage, recordUse } from "@/services/usage.service";

/** Recently used items, read from this device and kept up to date as items are opened. */
export function UsageProvider({ children }: { children: ReactNode }) {
  const [usage, setUsage] = useState<UsageMap>({});

  useEffect(() => {
    let cancelled = false;
    loadUsage()
      .then((loaded) => {
        if (!cancelled) setUsage(loaded);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const touch = useCallback((id: string, kind: EntryKind) => {
    // Shown at once; saved in the background (a failed save only loses a convenience).
    setUsage((current) => ({ ...current, [id]: { kind, at: Date.now() } }));
    recordUse(id, kind).catch(() => undefined);
  }, []);

  const clear = useCallback(() => {
    setUsage({});
    clearUsage().catch(() => undefined);
  }, []);

  const value = useMemo<UsageContextValue>(() => ({ usage, touch, clear }), [usage, touch, clear]);
  return <UsageContext value={value}>{children}</UsageContext>;
}
