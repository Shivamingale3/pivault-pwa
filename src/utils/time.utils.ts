const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** "just now", "4 min ago", "3 h ago", "2 d ago". */
export function formatRelative(epochMs: number, now: number = Date.now()): string {
  const elapsed = Math.max(0, now - epochMs);
  if (elapsed < MINUTE_MS) return "just now";
  if (elapsed < HOUR_MS) return `${String(Math.floor(elapsed / MINUTE_MS))} min ago`;
  if (elapsed < DAY_MS) return `${String(Math.floor(elapsed / HOUR_MS))} h ago`;
  return `${String(Math.floor(elapsed / DAY_MS))} d ago`;
}

const timeOfDay = (epochMs: number): string =>
  new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }).format(
    epochMs,
  );

const startOfDay = (epochMs: number): number => {
  const date = new Date(epochMs);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/** "Today at 09:52", "Yesterday at 09:52", or "Nov 14 at 09:52". */
export function formatWhen(epochMs: number, now: number = Date.now()): string {
  const days = Math.round((startOfDay(now) - startOfDay(epochMs)) / DAY_MS);
  if (days === 0) return `Today at ${timeOfDay(epochMs)}`;
  if (days === 1) return `Yesterday at ${timeOfDay(epochMs)}`;
  const date = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    epochMs,
  );
  return `${date} at ${timeOfDay(epochMs)}`;
}
