import { toast } from "sonner";
import { AVATAR_COPY, AVATAR_SEEDS } from "@/constants/settings.constants";
import { useAvatarChoice } from "@/hooks/use-avatar";
import { AVATAR_STYLES, type AvatarChoice } from "@/schemas/preferences.schema";
import { savePreferences } from "@/services/preferences.service";

/** Every avatar on offer: each style with each seed. */
export const AVATAR_OPTIONS: readonly AvatarChoice[] = AVATAR_STYLES.flatMap((style) =>
  AVATAR_SEEDS.map((seed) => ({ style, seed })),
);

const same = (a: AvatarChoice | null, b: AvatarChoice | null): boolean =>
  a === null || b === null ? a === b : a.style === b.style && a.seed === b.seed;

/** The avatar picker: what is picked now, and picking another (saved at once, on this phone). */
export function useAvatarPicker() {
  const current = useAvatarChoice();
  return {
    options: AVATAR_OPTIONS,
    isPicked: (choice: AvatarChoice | null) => same(current, choice),
    pick: (choice: AvatarChoice | null) => {
      if (same(current, choice)) return;
      savePreferences({ avatar: choice })
        .then(() => toast.success(AVATAR_COPY.saved))
        .catch(() => toast.error(AVATAR_COPY.failed));
    },
  };
}
