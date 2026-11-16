import type { ReactNode } from "react";

/** The lock screens: full height, centred column, 26 px sides, content spread by spacers. */
export function GateLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-full w-full justify-center bg-background">
      <div className="flex w-full max-w-md flex-1 flex-col items-center gap-3 px-6.5 pt-[max(--spacing(10),env(safe-area-inset-top))] pb-[max(--spacing(6.5),env(safe-area-inset-bottom))]">
        {children}
      </div>
    </main>
  );
}
