import { UserAvatar } from "@/components/modules/kit/user-avatar";
import { SettingsHeader } from "@/components/modules/settings/settings-header";
import { SettingsLayout } from "@/components/modules/settings/settings-layout";
import { Button } from "@/components/ui/button";
import { AVATAR_COPY, SETTINGS_COPY } from "@/constants/settings.constants";
import { useAvatarPicker } from "@/hooks/use-avatar-picker";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes/route-paths";
import type { AvatarChoice } from "@/schemas/preferences.schema";

const TILE = "size-auto aspect-square h-auto w-full rounded-2xl border-[1.5px] p-1.5";

/** Settings › Avatar: your initial, or one of the drawn characters. Picking saves at once. */
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
      <div role="group" aria-label={AVATAR_COPY.title} className="grid grid-cols-3 gap-3">
        {tile(null, AVATAR_COPY.initial)}
        {picker.options.map((choice, index) => tile(choice, AVATAR_COPY.pick(index + 1)))}
      </div>
    </SettingsLayout>
  );
}
