import type { ReactNode } from "react";

interface DetailFieldProps {
  label: string;
  children: ReactNode;
  /** Buttons for this field, e.g. show and copy. */
  actions?: ReactNode;
}

export function DetailField({ label, children, actions }: DetailFieldProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-muted px-4.5 py-3.5">
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
        <dd className="text-[0.9375rem] font-medium break-words whitespace-pre-wrap">{children}</dd>
      </div>
      {actions && <div className="flex shrink-0 gap-1">{actions}</div>}
    </div>
  );
}
