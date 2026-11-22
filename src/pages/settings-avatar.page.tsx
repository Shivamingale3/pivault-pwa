import { AvatarStyleChips } from "@/components/modules/settings/avatar-style-chips";
import { UserAvatar } from "@/components/modules/kit/user-avatar";
import { SettingsHeader } from "@/components/modules/settings/settings-header";
import { SettingsLayout } from "@/components/modules/settings/settings-layout";
import { Button } from "@/components/ui/button";
import { AVATAR_CREDITS } from "@/constants/avatar.constants";
import { AVATAR_COPY, SETTINGS_COPY } from "@/constants/settings.constants";
import { useAvatarPicker } from "@/hooks/use-avatar-picker";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes/route-paths";
import type { AvatarChoice } from "@/schemas/preferences.schema";

const TILE = "aspect-square h-auto w-full rounded-2xl border-[1.5px] p-1.5";

/** Settings › Avatar: your initial, or any character from any DiceBear style. Picking saves at once. */
export function SettingsAvatarPage() {
  const picker = useAvatarPicker();
  const session = useSession();
  const name = session ? `${session.firstName} ${session.lastName}`.trim() || session.email : "";

  const tile = (choice: AvatarChoice | null, label: string) => {
    const picked = picker.isPicked(choice);
    return (
      <Button
        key={choice ? `${choice.style}-${choice.seed}` : "initial"}
        type="button"
        variant="ghost"
        aria-label={label}
        aria-pressed={picked}
        className={cn(TILE, picked ? "border-primary bg-muted" : "border-border bg-card")}
        onClick={() => {
          picker.pick(choice);
        }}
      >
        <UserAvatar name={name} choice={choice} className="size-full rounded-xl text-2xl" />
      </Button>
    );
  };

  return (
    <SettingsLayout>
      <SettingsHeader
        title={AVATAR_COPY.title}
        backTo={ROUTES.settings}
        parent={SETTINGS_COPY.title}
      />
      <AvatarStyleChips styles={picker.styles} value={picker.style} onChange={picker.setStyle} />
      <div role="group" aria-label={AVATAR_COPY.characters} className="grid grid-cols-3 gap-3">
        {tile(null, AVATAR_COPY.initial)}
        {picker.options.map((choice, index) => tile(choice, AVATAR_COPY.pick(index + 1)))}
      </div>
      {picker.canShowMore && (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="border-border"
          onClick={picker.showMore}
        >
          {AVATAR_COPY.more}
        </Button>
      )}
      <p className="mt-auto text-center text-[0.71875rem] leading-relaxed font-medium text-pretty text-muted-foreground">
        {AVATAR_CREDITS}
      </p>
    </SettingsLayout>
  );
}
