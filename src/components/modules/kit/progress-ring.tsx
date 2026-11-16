import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  /** 0 to 100. */
  percent: number;
  size?: number;
  strokeWidth?: number;
  /** Failure look: destructive stroke. */
  destructive?: boolean;
  label: string;
  children?: ReactNode;
}

/** A ring with something in the middle (a percent or an icon). */
export function ProgressRing({
  percent,
  size = 76,
  strokeWidth = 4,
  destructive = false,
  label,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className={cn(
            "transition-[stroke-dashoffset]",
            destructive ? "stroke-destructive" : "stroke-foreground",
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold [&_svg]:size-6">
        {children}
      </div>
    </div>
  );
}
