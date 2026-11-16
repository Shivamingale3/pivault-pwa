import { useEffect, useState } from "react";

const TICK_MS = 1000;

/**
 * Milliseconds left until `endsAt` (an epoch time), ticking once a second. Zero when there is
 * nothing to wait for. `onEnd` runs once when the wait runs out.
 */
export function useCountdown(endsAt: number | null, onEnd?: () => void): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) return;
    const tick = () => {
      setNow(Date.now());
    };
    // An immediate refresh (from a timer, not the effect body) so a new wait starts accurate.
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, TICK_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [endsAt]);

  const remaining = endsAt === null ? 0 : Math.max(0, endsAt - now);

  useEffect(() => {
    if (endsAt !== null && remaining === 0) onEnd?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when the wait ends, not when the callback changes
  }, [endsAt, remaining === 0]);

  return remaining;
}
