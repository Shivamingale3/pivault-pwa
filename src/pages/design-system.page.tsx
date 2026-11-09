import { BrandHero } from "@/components/modules/design-system/brand-hero";
import { ButtonShowcase } from "@/components/modules/design-system/button-showcase";
import { ColorPalette } from "@/components/modules/design-system/color-palette";
import { FeedbackShowcase } from "@/components/modules/design-system/feedback-showcase";
import { FormShowcase } from "@/components/modules/design-system/form-showcase";
import { OverlayShowcase } from "@/components/modules/design-system/overlay-showcase";
import { TypographyScale } from "@/components/modules/design-system/typography-scale";
import { ThemeToggle } from "@/components/modules/theme/theme-toggle";

/** Living reference for tokens and core components, in both themes. */
export function DesignSystemPage() {
  return (
    <main className="flex min-h-full w-full flex-col items-center bg-background">
      <div className="flex w-full max-w-3xl flex-1 flex-col gap-12 px-4 pt-[max(--spacing(4),env(safe-area-inset-top))] pb-[max(--spacing(12),env(safe-area-inset-bottom))] sm:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
          <BrandHero />
        </div>
        <ColorPalette />
        <TypographyScale />
        <ButtonShowcase />
        <FormShowcase />
        <FeedbackShowcase />
        <OverlayShowcase />
      </div>
    </main>
  );
}
