import type { ReactNode } from "react";

interface ShowcaseSectionProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
}

/** A labelled block on the design-system page: mono eyebrow, heading, content. */
export function ShowcaseSection({ eyebrow, title, children }: ShowcaseSectionProps) {
  return (
    <section aria-label={title} className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <span className="text-eyebrow">{eyebrow}</span>
        <h2 className="text-[1.1875rem] leading-tight font-extrabold tracking-tight">{title}</h2>
      </header>
      {children}
    </section>
  );
}
