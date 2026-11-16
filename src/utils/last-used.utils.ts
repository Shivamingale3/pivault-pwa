const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

/** A compact "when": 2H AGO, YESTERDAY, 3 DAYS, 1 WEEK, 2 WEEKS, 1 MONTH (the sort state's right-hand label). */
export function formatLastUsed(epochMs: number, now: number = Date.now()): string {
  const elapsed = Math.max(0, now - epochMs);
  if (elapsed < HOUR_MS) return `${String(Math.max(1, Math.floor(elapsed / 60_000)))}M AGO`;
  if (elapsed < DAY_MS) return `${String(Math.floor(elapsed / HOUR_MS))}H AGO`;
  const days = Math.floor(elapsed / DAY_MS);
  if (days === 1) return "YESTERDAY";
  if (days < 7) return `${String(days)} DAYS`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return `${String(weeks)} ${weeks === 1 ? "WEEK" : "WEEKS"}`;
  const months = Math.floor(days / 30);
  return `${String(months)} ${months === 1 ? "MONTH" : "MONTHS"}`;
}
