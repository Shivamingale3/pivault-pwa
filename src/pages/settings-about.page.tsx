import { AppLogo } from "@/components/modules/brand/app-logo";
import { KeyValueCard } from "@/components/modules/settings/key-value-card";
import { SettingsHeader } from "@/components/modules/settings/settings-header";
import { SettingsLayout } from "@/components/modules/settings/settings-layout";
import { ABOUT_COPY, SETTINGS_COPY } from "@/constants/settings.constants";
import { useSession } from "@/hooks/use-session";
import { ROUTES } from "@/routes/route-paths";

/** Settings › About: the logo and name, then what runs where. */
export function SettingsAboutPage() {
  const session = useSession();
  return (
    <SettingsLayout>
      <SettingsHeader
        title={ABOUT_COPY.title}
        backTo={ROUTES.settings}
        parent={SETTINGS_COPY.title}
      />
      <div className="flex flex-col items-center gap-3 py-2">
        <AppLogo className="size-13 rounded-[1.125rem]" />
        <p className="text-[1.1875rem] font-extrabold tracking-tight">PiVault</p>
      </div>
      <KeyValueCard
        label={ABOUT_COPY.title.toUpperCase()}
        rows={[
          { name: ABOUT_COPY.server, value: window.location.host },
          { name: ABOUT_COPY.account, value: session?.email ?? "…" },
          { name: ABOUT_COPY.encryption, value: ABOUT_COPY.encryptionValue },
          { name: ABOUT_COPY.backup, value: ABOUT_COPY.backupValue },
          { name: ABOUT_COPY.api, value: ABOUT_COPY.apiValue },
        ]}
      />
      <p className="mt-auto text-center text-[0.71875rem] font-medium text-pretty text-muted-foreground">
        {ABOUT_COPY.footer}
      </p>
    </SettingsLayout>
  );
}
