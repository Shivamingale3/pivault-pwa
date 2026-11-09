/** User-selectable theme preference. `as const` object because the project uses erasableSyntaxOnly. */
export const Theme = {
  System: "system",
  Light: "light",
  Dark: "dark",
} as const;

export type Theme = (typeof Theme)[keyof typeof Theme];

/** Theme actually painted on screen once `system` is resolved. */
export type ResolvedTheme = Exclude<Theme, typeof Theme.System>;
