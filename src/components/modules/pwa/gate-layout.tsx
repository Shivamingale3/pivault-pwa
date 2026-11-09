import type { ReactNode } from "react";
import { BrandHero } from "@/components/modules/brand/brand-hero";
import { GATE_COPY } from "@/constants/install-steps.constants";

interface GateLayoutProps {
  title: string;
  description: string;
  children?: ReactNode;
  footer?: ReactNode;
}

/** Full-screen layout shared by the install, installed and unsupported screens (sign-in artboard). */
export function GateLayout({ title, description, children, footer }: GateLayoutProps) {
  return (
    <main className="flex min-h-full w-full justify-center bg-background">
      <div className="flex w-full max-w-md flex-1 flex-col gap-6 px-3.5 pt-[max(--spacing(3.5),env(safe-area-inset-top))] pb-[max(--spacing(6.5),env(safe-area-inset-bottom))]">
        <BrandHero eyebrow={GATE_COPY.eyebrow} />
        <div className="flex flex-1 flex-col gap-5 px-3">
          <header className="flex flex-col gap-2">
            <h1 className="text-display">{title}</h1>
            <p className="text-sm leading-relaxed font-medium text-pretty text-muted-foreground">
              {description}
            </p>
          </header>
          {children}
        </div>
        {footer && <div className="flex flex-col gap-3 px-3">{footer}</div>}
      </div>
    </main>
  );
}
