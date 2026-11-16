import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

/** A centred block for an empty list: icon tile, heading 19/800, body 13.5 muted, then the actions. */
export function EmptyState({ icon, title, children, actions }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-2 text-center">
      <span
        aria-hidden="true"
        className="flex size-13.5 items-center justify-center rounded-[1.1875rem] border-[1.5px] border-border bg-muted [&_svg]:size-6"
      >
        {icon}
      </span>
      <h2 className="text-[1.1875rem] font-extrabold tracking-tight">{title}</h2>
      <p className="max-w-72 text-[0.84375rem] leading-relaxed font-medium text-pretty text-muted-foreground">
        {children}
      </p>
      {actions && <div className="mt-1.5 flex flex-col items-center gap-2.5">{actions}</div>}
    </div>
  );
}
