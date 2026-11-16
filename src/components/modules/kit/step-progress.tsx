import { cn } from "@/lib/utils";

interface StepProgressProps {
  step: number;
  total: number;
}

/** Equal segments (h 3, gap 6): the current and earlier steps in ink, the rest in the border colour. */
export function StepProgress({ step, total }: StepProgressProps) {
  return (
    <div
      role="progressbar"
      aria-label={`Step ${String(step)} of ${String(total)}`}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step}
      className="flex gap-1.5"
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn("h-0.75 flex-1 rounded-full", index < step ? "bg-foreground" : "bg-border")}
        />
      ))}
    </div>
  );
}
