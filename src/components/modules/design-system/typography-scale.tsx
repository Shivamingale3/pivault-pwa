import { TYPE_SCALE } from "@/constants/design-system.constants";
import { Separator } from "@/components/ui/separator";
import { ShowcaseSection } from "@/components/modules/design-system/showcase-section";

export function TypographyScale() {
  return (
    <ShowcaseSection eyebrow="02 · Type" title="Plus Jakarta Sans, mono for labels">
      <dl className="flex flex-col gap-4">
        {TYPE_SCALE.map((item, index) => (
          <div key={item.label} className="flex flex-col gap-3">
            {index > 0 && <Separator />}
            <dt className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-bold">{item.label}</span>
              <span className="font-mono text-[0.6875rem] text-muted-foreground">{item.spec}</span>
            </dt>
            <dd className={item.className}>{item.sample}</dd>
          </div>
        ))}
      </dl>
    </ShowcaseSection>
  );
}
