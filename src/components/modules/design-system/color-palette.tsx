import { COLOR_SWATCHES } from "@/constants/design-system.constants";
import { cn } from "@/lib/utils";
import { ShowcaseSection } from "@/components/modules/design-system/showcase-section";

export function ColorPalette() {
  return (
    <ShowcaseSection eyebrow="01 · Colour" title="Warm neutrals, rust and teal">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {COLOR_SWATCHES.map((swatch) => (
          <li
            key={swatch.token}
            className="flex flex-col overflow-hidden rounded-lg border-[1.5px] border-border"
          >
            <span
              aria-hidden="true"
              className={cn("h-16 border-b border-border", swatch.className)}
            />
            <span className="flex flex-col gap-1 p-3">
              <span className="text-[0.8125rem] font-bold">{swatch.name}</span>
              <code className="font-mono text-[0.6875rem] text-muted-foreground">
                {swatch.token}
              </code>
              <span className="text-xs font-medium text-muted-foreground">{swatch.usage}</span>
            </span>
          </li>
        ))}
      </ul>
    </ShowcaseSection>
  );
}
