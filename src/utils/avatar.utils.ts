import type { AvatarChoice } from "@/schemas/preferences.schema";

/** Picture size in px; drawn as SVG so it stays sharp at any size. */
const SIZE = 128;
const cache = new Map<string, Promise<string>>();

/**
 * The avatar as a data: URI (allowed by the CSP, nothing is fetched). DiceBear and its styles are
 * loaded only when an avatar is first shown, so the first screen stays small.
 */
export function avatarDataUri(choice: AvatarChoice): Promise<string> {
  const key = `${choice.style}:${choice.seed}`;
  let made = cache.get(key);
  if (!made) {
    made = (async () => {
      const { createAvatar } = await import("@dicebear/core");
      const options = { seed: choice.seed, size: SIZE };
      // Each style has its own option types, so each is drawn on its own branch.
      if (choice.style === "lorelei") {
        return createAvatar(await import("@dicebear/lorelei"), options).toDataUri();
      }
      return createAvatar(await import("@dicebear/notionists"), options).toDataUri();
    })();
    // A failed load is retried next time instead of being remembered.
    made.catch(() => cache.delete(key));
    cache.set(key, made);
  }
  return made;
}
