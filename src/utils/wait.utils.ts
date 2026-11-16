/** 30 -> "30 sec", 300 -> "5 min", 3600 -> "1 hour": the next wait named in a lockout caption. */
export function formatWait(seconds: number): string {
  if (seconds < 60) return `${String(seconds)} sec`;
  if (seconds < 3600) return `${String(Math.round(seconds / 60))} min`;
  const hours = Math.round(seconds / 3600);
  return `${String(hours)} ${hours === 1 ? "hour" : "hours"}`;
}
