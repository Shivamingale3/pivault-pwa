import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface SettingsGroupProps {
  /** Mono eyebrow above the card, e.g. "SERVER". */
  label?: string;
  children: ReactNode;
}

/** An eyebrow, then one card whose rows are divided by hairlines. */
export function SettingsGroup({ label, children }: SettingsGroupProps) {
  return (
    <section className="flex flex-col gap-2.5">
      {label && <h2 className="px-1 text-eyebrow">{label}</h2>}
      <Card className="gap-0 divide-y divide-border p-0">{children}</Card>
    </section>
  );
}
