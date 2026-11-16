import type { ReactNode } from "react";

interface HeadingBlockProps {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}

/** An optional mono eyebrow, the screen title (27/800) and its body copy. */
export function HeadingBlock({ eyebrow, title, children }: HeadingBlockProps) {
  return (
    <header className="flex animate-rise flex-col gap-2.5">
      {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
      <h1 className="text-display">{title}</h1>
      {children && (
        <p className="text-sm leading-relaxed font-medium text-pretty text-muted-foreground">
          {children}
        </p>
      )}
    </header>
  );
}
