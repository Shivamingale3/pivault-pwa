import type { ReactNode } from "react";
import { BackButton } from "@/components/modules/kit/back-button";

/** A detail or editor screen's top row: back button on the left, actions or a chip on the right. */
export function ScreenHeader({ backTo, children }: { backTo: string; children?: ReactNode }) {
  return (
    <header className="flex shrink-0 animate-rise items-center justify-between gap-3">
      <BackButton fallback={backTo} />
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
