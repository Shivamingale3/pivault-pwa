import type { ReactNode } from "react";

interface FieldCardProps {
  label: string;
  children: ReactNode;
  /** Buttons on the right: reveal, copy. */
  actions?: ReactNode;
}

/** A detail screen's field: bordered card (radius 18), eyebrow label, value 15/500, actions on the right. */
export function FieldCard({ label, children, actions }: FieldCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.125rem] border-[1.5px] border-border px-4 py-3">
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-eyebrow">{label}</dt>
        <dd className="text-[0.9375rem] font-medium wrap-break-word">{children}</dd>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  );
}
