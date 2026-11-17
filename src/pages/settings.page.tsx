import {
  GripIcon,
  InfoIcon,
  KeyRoundIcon,
  LockIcon,
  LogOutIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SmileIcon,
} from "lucide-react";
import { useState } from "react";
import { ProfileCard } from "@/components/modules/settings/profile-card";
import { SettingsGroup } from "@/components/modules/settings/settings-group";
import { SettingsHeader } from "@/components/modules/settings/settings-header";
import { SettingsLayout } from "@/components/modules/settings/settings-layout";
import { SettingsRow } from "@/components/modules/settings/settings-row";
import { SignOutDialog } from "@/components/modules/settings/sign-out-dialog";
import { APP_VERSION } from "@/constants/app-version.constants";
import { ABOUT_COPY, SETTINGS_COPY, SYNC_COPY } from "@/constants/settings.constants";
import { useAuth } from "@/hooks/use-auth";
import { useSession } from "@/hooks/use-session";
import { useSync } from "@/hooks/use-sync";
import { ROUTES } from "@/routes/route-paths";
import { formatRelative } from "@/utils/time.utils";

const STATUS: Record<string, string> = {
  synced: SYNC_COPY.upToDate,
  syncing: SYNC_COPY.syncing,
  offline: SYNC_COPY.offline,
  error: SYNC_COPY.problem,
  ended: SYNC_COPY.ended,
};

/** Settings home: who is signed in, the server group (Sync) and Sign out as the last row. */
export function SettingsPage() {
  const { lock } = useAuth();
  const session = useSession();
  const { status, stats } = useSync();
  const [confirming, setConfirming] = useState(false);
  const last = stats.lastSyncedAt;

  return (
    <SettingsLayout>
      <SettingsHeader title={SETTINGS_COPY.title} backTo={ROUTES.home} />
      <ProfileCard session={session} />
      <SettingsGroup label={SETTINGS_COPY.groupAccount}>
        <SettingsRow
          title={SETTINGS_COPY.changePassword}
          icon={<KeyRoundIcon aria-hidden="true" />}
          to={ROUTES.settingsPassword}
        />
        <SettingsRow
          title={SETTINGS_COPY.avatar}
          meta={SETTINGS_COPY.avatarMeta}
          icon={<SmileIcon aria-hidden="true" />}
          to={ROUTES.settingsAvatar}
        />
        <SettingsRow
          title={SETTINGS_COPY.changePin}
          meta={SETTINGS_COPY.changePinMeta}
          icon={<GripIcon aria-hidden="true" />}
          to={ROUTES.settingsPin}
        />
      </SettingsGroup>
      <SettingsGroup label={SETTINGS_COPY.groupSecurity}>
        <SettingsRow
          title={SETTINGS_COPY.security}
          meta={SETTINGS_COPY.securityMeta}
          icon={<ShieldCheckIcon aria-hidden="true" />}
          to={ROUTES.settingsSecurity}
        />
        <SettingsRow
          title={SETTINGS_COPY.lockNow}
          meta={SETTINGS_COPY.lockMeta}
          icon={<LockIcon aria-hidden="true" />}
          onClick={lock}
        />
      </SettingsGroup>
      <SettingsGroup label={SETTINGS_COPY.groupSync}>
        <SettingsRow
          title={SETTINGS_COPY.syncRow}
          meta={
            last === null ? STATUS[status] : `${STATUS[status] ?? ""} · ${formatRelative(last)}`
          }
          icon={<RefreshCwIcon aria-hidden="true" />}
          to={ROUTES.settingsSync}
        />
      </SettingsGroup>
      <SettingsGroup label={SETTINGS_COPY.groupApp}>
        <SettingsRow
          title={SETTINGS_COPY.about}
          meta={`${ABOUT_COPY.version} ${APP_VERSION}`}
          icon={<InfoIcon aria-hidden="true" />}
          to={ROUTES.settingsAbout}
        />
      </SettingsGroup>
      <SettingsGroup>
        <SettingsRow
          title={SETTINGS_COPY.signOut}
          icon={<LogOutIcon aria-hidden="true" />}
          destructive
          onClick={() => {
            setConfirming(true);
          }}
        />
      </SettingsGroup>
      <p className="mt-auto text-center text-[0.71875rem] font-medium text-muted-foreground">
        {SETTINGS_COPY.footer(APP_VERSION)}
      </p>
      {confirming && (
        <SignOutDialog
          mayLoseChanges={status !== "synced"}
          onClose={() => {
            setConfirming(false);
          }}
        />
      )}
    </SettingsLayout>
  );
}
