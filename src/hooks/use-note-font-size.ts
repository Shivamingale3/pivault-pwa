import { useEffect, useState } from "react";
import { DEFAULT_PREFERENCES, type NoteFontSize } from "@/schemas/preferences.schema";
import { savePreferences, watchPreferences } from "@/services/preferences.service";

/** The note text size (a choice on this phone), kept up to date as it changes. */
export function useNoteFontSize() {
  const [size, setSize] = useState<NoteFontSize>(DEFAULT_PREFERENCES.noteFontSize);
  useEffect(() => {
    const subscription = watchPreferences().subscribe((preferences) => {
      setSize(preferences.noteFontSize);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return {
    size,
    /** Applies at once and saves; a failed save leaves the old size. */
    choose: (next: NoteFontSize) => savePreferences({ noteFontSize: next }),
  };
}
