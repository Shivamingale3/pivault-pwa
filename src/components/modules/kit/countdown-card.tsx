import { formatCountdown } from "@/utils/countdown.utils";

interface CountdownCardProps {
  /** Mono eyebrow, e.g. "TRY AGAIN IN". */
  label: string;
  remainingMs: number;
  /** Caption under the timer, e.g. "Attempt 5 of 5 · next wait 5 min". */
  caption: string;
}

/**
 * The live wait: eyebrow, 44 px mono timer, caption. A status region that is not announced every
 * second (`aria-live="off"`).
 */
export function CountdownCard({ label, remainingMs, caption }: CountdownCardProps) {
  return (
    <div
      role="status"
      aria-live="off"
      aria-label={`${label} ${formatCountdown(remainingMs)}`}
      className="flex flex-col items-center gap-2.5 rounded-3xl border-[1.5px] border-border bg-muted p-5.5 text-center"
    >
      <p className="text-eyebrow">{label}</p>
      <p className="font-mono text-[2.75rem] leading-none font-bold tabular-nums">
        {formatCountdown(remainingMs)}
      </p>
      <p className="text-[0.78125rem] font-semibold text-muted-foreground">{caption}</p>
    </div>
  );
}
