import type { Options as CoreOptions, Style } from "@dicebear/core";
import type { AvatarStyleId } from "@/constants/avatar.constants";
import type { AvatarChoice } from "@/schemas/preferences.schema";

/** Picture size in px; drawn as SVG so it stays sharp at any size. */
const SIZE = 128;
const cache = new Map<string, Promise<string>>();

/** The options every style shares; a style's own extra options are left at their defaults. */
type Draw = (options: CoreOptions) => Promise<string>;

/** Each style has its own option types, so each is drawn through its own loader. */
const via =
  <O extends object>(load: () => Promise<Style<O>>): Draw =>
  async (options) => {
    const { createAvatar } = await import("@dicebear/core");
    // Only the options every style shares are passed, which any style accepts.
    const shared = options as unknown as Partial<O & CoreOptions>;
    return createAvatar(await load(), shared).toDataUri();
  };

/** One lazy chunk per style: nothing is downloaded until that style is shown. */
const DRAW: Record<AvatarStyleId, Draw> = {
  adventurer: via(() => import("@dicebear/adventurer")),
  "adventurer-neutral": via(() => import("@dicebear/adventurer-neutral")),
  avataaars: via(() => import("@dicebear/avataaars")),
  "avataaars-neutral": via(() => import("@dicebear/avataaars-neutral")),
  "big-ears": via(() => import("@dicebear/big-ears")),
  "big-ears-neutral": via(() => import("@dicebear/big-ears-neutral")),
  "big-smile": via(() => import("@dicebear/big-smile")),
  bottts: via(() => import("@dicebear/bottts")),
  "bottts-neutral": via(() => import("@dicebear/bottts-neutral")),
  croodles: via(() => import("@dicebear/croodles")),
  "croodles-neutral": via(() => import("@dicebear/croodles-neutral")),
  dylan: via(() => import("@dicebear/dylan")),
  "fun-emoji": via(() => import("@dicebear/fun-emoji")),
  glass: via(() => import("@dicebear/glass")),
  icons: via(() => import("@dicebear/icons")),
  identicon: via(() => import("@dicebear/identicon")),
  initials: via(() => import("@dicebear/initials")),
  lorelei: via(() => import("@dicebear/lorelei")),
  "lorelei-neutral": via(() => import("@dicebear/lorelei-neutral")),
  micah: via(() => import("@dicebear/micah")),
  miniavs: via(() => import("@dicebear/miniavs")),
  notionists: via(() => import("@dicebear/notionists")),
  "notionists-neutral": via(() => import("@dicebear/notionists-neutral")),
  "open-peeps": via(() => import("@dicebear/open-peeps")),
  personas: via(() => import("@dicebear/personas")),
  "pixel-art": via(() => import("@dicebear/pixel-art")),
  "pixel-art-neutral": via(() => import("@dicebear/pixel-art-neutral")),
  rings: via(() => import("@dicebear/rings")),
  shapes: via(() => import("@dicebear/shapes")),
  thumbs: via(() => import("@dicebear/thumbs")),
  "toon-head": via(() => import("@dicebear/toon-head")),
};

/**
 * The avatar as a data: URI (allowed by the CSP, nothing is fetched). DiceBear and the style are
 * loaded only when an avatar is first shown, so the first screen stays small.
 */
export function avatarDataUri(choice: AvatarChoice): Promise<string> {
  const key = `${choice.style}:${choice.seed}`;
  let made = cache.get(key);
  if (!made) {
    made = DRAW[choice.style]({ seed: choice.seed, size: SIZE });
    // A failed load is retried next time instead of being remembered.
    made.catch(() => cache.delete(key));
    cache.set(key, made);
  }
  return made;
}
