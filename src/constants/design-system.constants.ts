/** Data for the design-system showcase. Class names are literal so Tailwind can see them. */

export interface ColorSwatch {
  name: string;
  token: string;
  className: string;
  usage: string;
}

export const COLOR_SWATCHES: readonly ColorSwatch[] = [
  { name: "Ink", token: "--foreground", className: "bg-foreground", usage: "Text, icons, focus" },
  { name: "Background", token: "--background", className: "bg-background", usage: "Screens" },
  { name: "Card", token: "--card", className: "bg-card", usage: "Raised surfaces" },
  { name: "Muted", token: "--muted", className: "bg-muted", usage: "Input fill, chips" },
  {
    name: "Muted text",
    token: "--muted-foreground",
    className: "bg-muted-foreground",
    usage: "Body copy",
  },
  { name: "Subtle", token: "--subtle", className: "bg-subtle", usage: "Labels, placeholders" },
  { name: "Line", token: "--border", className: "bg-border", usage: "Dividers, rows" },
  {
    name: "Line strong",
    token: "--border-strong",
    className: "bg-border-strong",
    usage: "Cards, outlines",
  },
  { name: "Hero", token: "--hero", className: "bg-hero", usage: "Brand card, toasts" },
  { name: "Rust", token: "--destructive", className: "bg-destructive", usage: "Failure" },
  {
    name: "Rust surface",
    token: "--destructive-surface",
    className: "bg-destructive-surface",
    usage: "Error banners",
  },
  { name: "Teal", token: "--success", className: "bg-success", usage: "Success, synced" },
];

export interface TypeSample {
  label: string;
  spec: string;
  className: string;
  sample: string;
}

export const TYPE_SCALE: readonly TypeSample[] = [
  {
    label: "Display",
    spec: "800 · 27px · -0.035em",
    className: "text-display",
    sample: "Unlock your vault",
  },
  {
    label: "Sheet title",
    spec: "800 · 21px",
    className: "text-[1.3125rem] leading-tight font-extrabold tracking-tight",
    sample: "Delete this note?",
  },
  {
    label: "Row title",
    spec: "700 · 15px",
    className: "text-[0.9375rem] font-bold tracking-tight",
    sample: "GitHub",
  },
  {
    label: "Body",
    spec: "500 · 14px · 1.55",
    className: "text-sm leading-relaxed font-medium text-muted-foreground",
    sample: "Your vault is encrypted on this device and syncs when you're online.",
  },
  {
    label: "Meta",
    spec: "500 · 12.5px",
    className: "text-[0.78125rem] font-medium text-muted-foreground",
    sample: "Edited 2 minutes ago",
  },
  {
    label: "Eyebrow",
    spec: "mono 700 · 10px · 0.2em",
    className: "text-eyebrow",
    sample: "Passwords",
  },
];

export const PIN_LENGTH = 6;
