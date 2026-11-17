import { RefreshCwIcon } from "lucide-react";
import { AppLogo } from "@/components/modules/brand/app-logo";
import { KeyValueCard } from "@/components/modules/settings/key-value-card";
import { SettingsHeader } from "@/components/modules/settings/settings-header";
import { SettingsLayout } from "@/components/modules/settings/settings-layout";
import { Button } from "@/components/ui/button";
import { APP_BUILT_AT, APP_VERSION } from "@/constants/app-version.constants";
import { ABOUT_COPY, SETTINGS_COPY } from "@/constants/settings.constants";
import { useSession } from "@/hooks/use-session";
import { useUpdateCheck } from "@/hooks/use-update-check";
import { ROUTES } from "@/routes/route-paths";
import { formatDay } from "@/utils/date-format.utils";

/** Settings › About: which version this phone runs (to compare between phones), and a way to update. */
export function SettingsAboutPage() {
  const session = useSession();
  const update = useUpdateCheck();
  return (
    <SettingsLayout>
      <SettingsHeader
        title={ABOUT_COPY.title}
        backTo={ROUTES.settings}
        parent={SETTINGS_COPY.title}
      />
      <div className="flex flex-col items-center gap-2 py-2">
        <AppLogo className="size-13 rounded-[1.125rem]" />
        <p className="text-[1.1875rem] font-extrabold tracking-tight">PiVault</p>
        <p className="text-[0.78125rem] font-medium text-muted-foreground">
          {ABOUT_COPY.version} {APP_VERSION}
        </p>
      </div>
      <KeyValueCard
        label={ABOUT_COPY.title.toUpperCase()}
        rows={[
          { name: ABOUT_COPY.version, value: APP_VERSION },
          {
            name: ABOUT_COPY.built,
            value: Number.isNaN(APP_BUILT_AT) ? "—" : formatDay(APP_BUILT_AT),
          },
          { name: ABOUT_COPY.account, value: session?.email ?? "…" },
        ]}
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={update.checking}
        onClick={() => void update.check()}
      >
        <RefreshCwIcon
          aria-hidden="true"
          className={update.checking ? "animate-spin" : undefined}
        />
        {update.checking ? ABOUT_COPY.checking : ABOUT_COPY.checkUpdate}
      </Button>
    </SettingsLayout>
  );
}
