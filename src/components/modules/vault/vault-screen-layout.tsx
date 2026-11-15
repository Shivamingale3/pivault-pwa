import type { ReactNode } from "react";

interface VaultScreenLayoutProps {
  header: ReactNode;
  toolbar: ReactNode;
  children: ReactNode;
  /** Pinned to the bottom, e.g. the add action. */
  footer: ReactNode;
}

/** Full-height vault screen: header and filters on top, the list in the middle, action pinned below. */
export function VaultScreenLayout({ header, toolbar, children, footer }: VaultScreenLayoutProps) {
  return (
    <main className="flex min-h-full w-full justify-center bg-background">
      <div className="flex w-full max-w-md flex-1 flex-col gap-4 px-6.5 pt-[max(--spacing(10),env(safe-area-inset-top))] pb-[max(--spacing(6.5),env(safe-area-inset-bottom))]">
        {header}
        {toolbar}
        <div className="flex flex-1 flex-col gap-2">{children}</div>
        {footer}
      </div>
    </main>
  );
}
