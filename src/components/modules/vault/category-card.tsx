import type { ReactNode } from "react";
import { Link } from "react-router";

interface CategoryCardProps {
  to: string;
  icon: ReactNode;
  title: string;
  count: string;
}

/** A dashboard card: 36 px glyph tile, title 14.5/700, count 12/500 muted. Scales slightly when pressed. */
export function CategoryCard({ to, icon, title, count }: CategoryCardProps) {
  return (
    <Link
      to={to}
      className="flex min-h-24 flex-col justify-between gap-3 rounded-[1.25rem] border-[1.5px] border-border bg-card p-4 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.985]"
    >
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-xl bg-muted [&_svg]:size-4.5"
      >
        {icon}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.90625rem] font-bold tracking-tight">{title}</span>
        <span className="text-xs font-medium text-muted-foreground">{count}</span>
      </span>
    </Link>
  );
}
