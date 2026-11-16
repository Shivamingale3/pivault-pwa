import { useEffect, useState } from "react";

export interface StorageEstimate {
  usage: number;
  quota: number;
}

/** How much space this app uses on the phone, as far as the browser will say. Null until known (or unsupported). */
export function useStorageEstimate(): StorageEstimate | null {
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!("storage" in navigator) || typeof navigator.storage.estimate !== "function") return;
    navigator.storage
      .estimate()
      .then(({ usage, quota }) => {
        if (!cancelled && usage !== undefined && quota !== undefined) setEstimate({ usage, quota });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return estimate;
}
