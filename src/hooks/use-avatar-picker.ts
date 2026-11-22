import { useState } from "react";
import { toast } from "sonner";
import {
  AVATAR_MAX_SEEDS,
  AVATAR_PAGE_SIZE,
  AVATAR_STYLES,
  type AvatarStyleId,
  DEFAULT_AVATAR_STYLE,
} from "@/constants/avatar.constants";
import { AVATAR_COPY } from "@/constants/settings.constants";
import { useAvatarChoice } from "@/hooks/use-avatar";
import type { AvatarChoice } from "@/schemas/preferences.schema";
import { currentPreferences, savePreferences } from "@/services/preferences.service";

const same = (a: AvatarChoice | null, b: AvatarChoice | null): boolean =>
  a === null || b === null ? a === b : a.style === b.style && a.seed === b.seed;

/**
 * The avatar picker: a style (the whole DiceBear collection), the characters of that style (more
 * on request), and picking one (saved at once, on this phone). A seed is just a name for a
 * character: the same seed always draws the same one.
 */
export function useAvatarPicker() {
  const current = useAvatarChoice();
  const [style, setStyle] = useState<AvatarStyleId>(
    () => currentPreferences().avatar?.style ?? DEFAULT_AVATAR_STYLE,
  );
  const [shown, setShown] = useState(AVATAR_PAGE_SIZE);

  return {
    styles: AVATAR_STYLES,
    style,
    setStyle: (next: AvatarStyleId) => {
      setStyle(next);
      setShown(AVATAR_PAGE_SIZE);
    },
    options: Array.from({ length: shown }, (_, index): AvatarChoice => ({
      style,
      seed: String(index + 1),
    })),
    canShowMore: shown < AVATAR_MAX_SEEDS,
    showMore: () => {
      setShown((count) => Math.min(AVATAR_MAX_SEEDS, count + AVATAR_PAGE_SIZE));
    },
    isPicked: (choice: AvatarChoice | null) => same(current, choice),
    pick: (choice: AvatarChoice | null) => {
      if (same(current, choice)) return;
      savePreferences({ avatar: choice })
        .then(() => toast.success(AVATAR_COPY.saved))
        .catch(() => toast.error(AVATAR_COPY.failed));
    },
  };
}
