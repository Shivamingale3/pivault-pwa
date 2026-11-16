import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StageState = "done" | "active" | "waiting";

export interface Stage {
  label: string;
  state: StageState;
  /** Mono value on the right: a count, "7 of 12" or "waiting". */
  value: string;
}

interface StageListProps {
  stages: Stage[];
  /** 0 to 100, for the thin bar under the list. */
  percent: number;
}

/** Named stages with counts and a thin progress bar: progress is never a bare spinner. */
export function StageList({ stages, percent }: StageListProps) {
  return (
    <div className="flex flex-col gap-3.5 rounded-3xl border-[1.5px] border-border bg-card p-4.5">
      <ul className="flex flex-col gap-3.5">
        {stages.map(({ label, state, value }) => (
          <li key={label} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] [&_svg]:size-3",
                state === "done" && "border-foreground bg-foreground text-background",
                state === "active" && "border-foreground",
                state === "waiting" && "border-border",
              )}
            >
              {state === "done" && <CheckIcon strokeWidth={3} />}
            </span>
            <span
              className={cn(
                "flex-1 text-sm font-semibold",
                state === "waiting" && "text-muted-foreground",
              )}
            >
              {label}
            </span>
            <span className="font-mono text-xs font-bold text-muted-foreground">{value}</span>
          </li>
        ))}
      </ul>
      <div
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        className="h-1 rounded-full bg-border"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${String(Math.min(100, Math.max(0, percent)))}%` }}
        />
      </div>
    </div>
  );
}
