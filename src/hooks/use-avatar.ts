import { useEffect, useState } from "react";
import type { AvatarChoice } from "@/schemas/preferences.schema";
import { watchPreferences } from "@/services/preferences.service";
import { avatarDataUri } from "@/utils/avatar.utils";

/** The user's picked avatar, or null for the initial. Follows a new pick at once. */
export function useAvatarChoice(): AvatarChoice | null {
  const [choice, setChoice] = useState<AvatarChoice | null>(null);
  useEffect(() => {
    const subscription = watchPreferences().subscribe((preferences) => {
      setChoice(preferences.avatar);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return choice;
}

/** The picture for an avatar choice, or null while it is drawn (or when there is no choice). */
export function useAvatarUri(choice: AvatarChoice | null): string | null {
  const key = choice ? `${choice.style}:${choice.seed}` : null;
  const [drawn, setDrawn] = useState<{ key: string; uri: string } | null>(null);
  useEffect(() => {
    if (!choice || !key) return;
    let cancelled = false;
    avatarDataUri(choice)
      .then((uri) => {
        if (!cancelled) setDrawn({ key, uri });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [choice, key]);
  return drawn?.key === key ? drawn.uri : null;
}
