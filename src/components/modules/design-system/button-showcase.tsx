import { ArrowRightIcon, CopyIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShowcaseSection } from "@/components/modules/design-system/showcase-section";

export function ButtonShowcase() {
  return (
    <ShowcaseSection eyebrow="03 · Actions" title="Pill buttons, one primary per screen">
      <div className="flex flex-col gap-3">
        <Button size="xl" className="w-full shadow-float">
          Unlock vault
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="lg" variant="secondary" className="w-full">
          Use PIN instead
        </Button>
        <Button variant="outline" className="w-full">
          Save recovery key
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="destructive">
          <Trash2Icon data-icon="inline-start" />
          Delete
        </Button>
        <Button variant="destructive-soft">Sign out</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="link">Forgot password?</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="secondary">
          <CopyIcon data-icon="inline-start" />
          Copy
        </Button>
        <Button size="icon-sm" variant="secondary" aria-label="Copy password">
          <CopyIcon />
        </Button>
        <Button size="icon" aria-label="Continue">
          <ArrowRightIcon />
        </Button>
        <Button disabled>Disabled</Button>
      </div>
    </ShowcaseSection>
  );
}
