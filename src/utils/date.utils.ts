/** "Nov 15, 2026, 4:30 PM" in the user's locale. */
export const formatDateTime = (epochMs: number): string =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(epochMs);
