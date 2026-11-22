import { AVATAR_STYLE_LABELS, type AvatarStyleId } from "@/constants/avatar.constants";
import { AVATAR_COPY } from "@/constants/settings.constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AvatarStyleChipsProps {
  styles: readonly AvatarStyleId[];
  value: AvatarStyleId;
  onChange: (style: AvatarStyleId) => void;
}

/** The styles as a row you can swipe sideways: names only, so no style is downloaded until opened. */
export function AvatarStyleChips({ styles, value, onChange }: AvatarStyleChipsProps) {
  return (
    <div
      role="group"
      aria-label={AVATAR_COPY.styles}
      className="-mx-5.5 flex gap-2 overflow-x-auto px-5.5 pb-1"
    >
      {styles.map((style) => {
        const picked = style === value;
        return (
          <Button
            key={style}
            type="button"
            size="sm"
            variant={picked ? "default" : "outline"}
            aria-pressed={picked}
            className={cn("shrink-0 rounded-full", !picked && "border-border bg-card")}
            onClick={() => {
              onChange(style);
            }}
          >
            {AVATAR_STYLE_LABELS[style]}
          </Button>
        );
      })}
    </div>
  );
}
