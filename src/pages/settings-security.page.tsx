import { ChoiceChips } from "@/components/modules/settings/choice-chips";
import { SettingsGroup } from "@/components/modules/settings/settings-group";
import { SettingsHeader } from "@/components/modules/settings/settings-header";
import { SettingsLayout } from "@/components/modules/settings/settings-layout";
import { SettingsRow } from "@/components/modules/settings/settings-row";
import { Switch } from "@/components/ui/switch";
import {
  CLIPBOARD_CHOICE_LABELS,
  LOCK_CHOICE_LABELS,
  SECURITY_COPY,
  SETTINGS_COPY,
} from "@/constants/settings.constants";
import { useSecuritySettings } from "@/hooks/use-security-settings";
import { ROUTES } from "@/routes/route-paths";
import { AUTO_LOCK_CHOICES, CLIPBOARD_CHOICES } from "@/schemas/preferences.schema";

const NEVER = "never";
const lockOptions = AUTO_LOCK_CHOICES.map((ms) => ({
  value: String(ms),
  label: LOCK_CHOICE_LABELS[ms] ?? "",
}));
const clipboardOptions = CLIPBOARD_CHOICES.map((ms) => {
  const value = ms === null ? NEVER : String(ms);
  return { value, label: CLIPBOARD_CHOICE_LABELS[value] ?? "" };
});

/** Settings › Security: biometric unlock, when the app locks, when the clipboard clears, Change PIN. */
export function SettingsSecurityPage() {
  const settings = useSecuritySettings();
  const { preferences } = settings;

  return (
    <SettingsLayout>
      <SettingsHeader
        title={SECURITY_COPY.title}
        backTo={ROUTES.settings}
        parent={SETTINGS_COPY.title}
      />
      <SettingsGroup>
        <div className="flex min-h-16.5 items-center justify-between gap-3.5 px-4 py-3">
          <label htmlFor="face-unlock" className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[0.90625rem] font-bold tracking-tight">
              {SECURITY_COPY.faceId}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {settings.faceAvailable ? SECURITY_COPY.faceIdMeta : SECURITY_COPY.faceIdUnavailable}
            </span>
          </label>
          <Switch
            id="face-unlock"
            checked={settings.faceOn}
            disabled={!settings.faceAvailable || settings.busy}
            onCheckedChange={(on) => void settings.toggleFace(on)}
          />
        </div>
      </SettingsGroup>
      <ChoiceChips
        label={SECURITY_COPY.lockAfter}
        value={String(preferences.autoLockMs)}
        options={lockOptions}
        onChange={(value) => {
          const picked = AUTO_LOCK_CHOICES.find((ms) => String(ms) === value);
          if (picked !== undefined) settings.change({ autoLockMs: picked });
        }}
      />
      <ChoiceChips
        label={SECURITY_COPY.clipboardAfter}
        value={preferences.clipboardClearMs === null ? NEVER : String(preferences.clipboardClearMs)}
        options={clipboardOptions}
        onChange={(value) => {
          const picked = CLIPBOARD_CHOICES.find(
            (ms) => (ms === null ? NEVER : String(ms)) === value,
          );
          if (picked !== undefined) settings.change({ clipboardClearMs: picked });
        }}
      />
      <SettingsGroup>
        <SettingsRow title={SECURITY_COPY.changePin} to={ROUTES.settingsPin} />
      </SettingsGroup>
    </SettingsLayout>
  );
}
