import type { ReactNode } from "react";

interface AuthScreenLayoutProps {
  title: string;
  description?: string;
  /** Icon shown in a tile above the title (status screens). */
  icon?: ReactNode;
  children?: ReactNode;
  /** Pinned to the bottom, e.g. the primary action. */
  footer?: ReactNode;
}

/** Full-height single-column layout shared by the auth screens (title, content, pinned action). */
export function AuthScreenLayout({
  title,
  description,
  icon,
  children,
  footer,
}: AuthScreenLayoutProps) {
  return (
    <main className="flex min-h-full w-full justify-center bg-background">
      <div className="flex w-full max-w-md flex-1 flex-col gap-6 px-6.5 pt-[max(--spacing(10),env(safe-area-inset-top))] pb-[max(--spacing(6.5),env(safe-area-inset-bottom))]">
        <header className="flex animate-rise flex-col gap-2.5">
          {icon && (
            <div
              aria-hidden="true"
              className="mb-2 flex size-13.5 items-center justify-center rounded-lg border-[1.5px] border-border bg-muted [&_svg]:size-6"
            >
              {icon}
            </div>
          )}
          <h1 className="text-display">{title}</h1>
          {description && (
            <p className="text-sm leading-relaxed font-medium text-pretty text-muted-foreground">
              {description}
            </p>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-5">{children}</div>
        {footer && <div className="flex flex-col gap-3">{footer}</div>}
      </div>
    </main>
  );
}
