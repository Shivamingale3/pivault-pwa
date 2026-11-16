import type { ReactNode } from "react";

interface SetupShellProps {
  children: ReactNode;
  /** Shows the content from the top (forms); `center` for the gate-style screens. */
  center?: boolean;
}

/** The setup screens: full height, 26 px sides, content flowing down with a spacer before the actions. */
export function SetupShell({ children, center = false }: SetupShellProps) {
  return (
    <main className="flex min-h-full w-full justify-center bg-background">
      <div
        className={
          center
            ? "flex w-full max-w-md flex-1 flex-col items-center gap-3 px-6.5 pt-[max(--spacing(10),env(safe-area-inset-top))] pb-[max(--spacing(6.5),env(safe-area-inset-bottom))]"
            : "flex w-full max-w-md flex-1 flex-col gap-4 px-6.5 pt-[max(--spacing(10),env(safe-area-inset-top))] pb-[max(--spacing(6.5),env(safe-area-inset-bottom))]"
        }
      >
        {children}
      </div>
    </main>
  );
}
