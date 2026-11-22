/**
 * Every DiceBear style on offer (the whole collection). Drawn on the phone, one lazy chunk per
 * style (see `utils/avatar.utils.ts`), so only the style being looked at is ever downloaded.
 */
export const AVATAR_STYLES = [
  "adventurer",
  "adventurer-neutral",
  "avataaars",
  "avataaars-neutral",
  "big-ears",
  "big-ears-neutral",
  "big-smile",
  "bottts",
  "bottts-neutral",
  "croodles",
  "croodles-neutral",
  "dylan",
  "fun-emoji",
  "glass",
  "icons",
  "identicon",
  "initials",
  "lorelei",
  "lorelei-neutral",
  "micah",
  "miniavs",
  "notionists",
  "notionists-neutral",
  "open-peeps",
  "personas",
  "pixel-art",
  "pixel-art-neutral",
  "rings",
  "shapes",
  "thumbs",
  "toon-head",
] as const;

export type AvatarStyleId = (typeof AVATAR_STYLES)[number];

export const AVATAR_STYLE_LABELS: Record<AvatarStyleId, string> = {
  adventurer: "Adventurer",
  "adventurer-neutral": "Adventurer neutral",
  avataaars: "Avataaars",
  "avataaars-neutral": "Avataaars neutral",
  "big-ears": "Big ears",
  "big-ears-neutral": "Big ears neutral",
  "big-smile": "Big smile",
  bottts: "Bottts",
  "bottts-neutral": "Bottts neutral",
  croodles: "Croodles",
  "croodles-neutral": "Croodles neutral",
  dylan: "Dylan",
  "fun-emoji": "Fun emoji",
  glass: "Glass",
  icons: "Icons",
  identicon: "Identicon",
  initials: "Initials",
  lorelei: "Lorelei",
  "lorelei-neutral": "Lorelei neutral",
  micah: "Micah",
  miniavs: "Miniavs",
  notionists: "Notionists",
  "notionists-neutral": "Notionists neutral",
  "open-peeps": "Open peeps",
  personas: "Personas",
  "pixel-art": "Pixel art",
  "pixel-art-neutral": "Pixel art neutral",
  rings: "Rings",
  shapes: "Shapes",
  thumbs: "Thumbs",
  "toon-head": "Toon head",
};

/** The style shown first on the picker when nothing is picked yet. */
export const DEFAULT_AVATAR_STYLE: AvatarStyleId = "notionists";

/** How many characters a style shows at first, and how many more each "Show more" adds. */
export const AVATAR_PAGE_SIZE = 12;
export const AVATAR_MAX_SEEDS = 96;

/**
 * Credit the artwork's authors, as their licences (CC BY 4.0) require. The rest of the artwork is
 * public domain (CC0), free for any use, or made by DiceBear.
 */
export const AVATAR_CREDITS =
  "Avatar artwork by Lisa Wischofsky, The Visual Team, Ashley Seo, vijay verma, Natalia Spivak, Davis Uche, Micah Lanier, Webpixels, Draftbit and Johan Melin (CC BY 4.0), Pablo Stanley, Zoish, The Bootstrap Authors and DiceBear. Drawn with DiceBear.";
