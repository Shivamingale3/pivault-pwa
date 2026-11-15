import type { ReactNode } from "react";

/** Settings sit on the canvas colour with 22 px sides, full height, content flowing down. */
export function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-full w-full justify-center bg-canvas">
      <div className="flex w-full max-w-md flex-1 flex-col gap-5 px-5.5 pt-[max(--spacing(10),env(safe-area-inset-top))] pb-[max(--spacing(6.5),env(safe-area-inset-bottom))]">
        {children}
      </div>
    </main>
  );
}
