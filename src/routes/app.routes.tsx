import { Route, Routes } from "react-router";
import { AuthStatus } from "@/enums/auth.enum";
import { DesignSystemPage } from "@/pages/design-system.page";
import { ForgotPasswordPage } from "@/pages/forgot-password.page";
import { HomePage } from "@/pages/home.page";
import { NoteEditPage, NoteNewPage } from "@/pages/note-editor.page";
import { NoteReadPage } from "@/pages/note-read.page";
import { PasswordDetailPage } from "@/pages/password-detail.page";
import { PasswordEditPage, PasswordNewPage } from "@/pages/password-form.page";
import { NotesPage } from "@/pages/notes.page";
import { PasswordsPage } from "@/pages/passwords.page";
import { SearchPage } from "@/pages/search.page";
import { LockPage } from "@/pages/lock.page";
import { LoginPage } from "@/pages/login.page";
import { SettingsPage } from "@/pages/settings.page";
import { SettingsRecoveryKeyPage } from "@/pages/settings-recovery-key.page";
import { SettingsAvatarPage } from "@/pages/settings-avatar.page";
import { SettingsAboutPage } from "@/pages/settings-about.page";
import { SettingsPasswordPage } from "@/pages/settings-password.page";
import { SettingsPinPage } from "@/pages/settings-pin.page";
import { SettingsSecurityPage } from "@/pages/settings-security.page";
import { SettingsSyncPage } from "@/pages/settings-sync.page";
import { ResetPasswordPage } from "@/pages/reset-password.page";
import { SetupEntryPage } from "@/pages/setup-entry.page";
import { SetupPinPage } from "@/pages/setup-pin.page";
import { SetupRecoverPage } from "@/pages/setup-recover.page";
import { SetupRecoveringPage } from "@/pages/setup-recovering.page";
import { SetupRecoveryConfirmPage } from "@/pages/setup-recovery-confirm.page";
import { SetupRecoveryKeyPage } from "@/pages/setup-recovery-key.page";
import { PrivateLayout } from "@/routes/private-layout";
import { ROUTES } from "@/routes/route-paths";
import { SetupLayout } from "@/routes/setup-layout";
import { StatusRedirect } from "@/routes/status-redirect";
import { ZoneGuard } from "@/routes/zone-guard";

export function AppRoutes() {
  return (
    <Routes>
      {/* Open to everyone: opened from the emailed link, touches no keys. */}
      <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
      {import.meta.env.DEV && <Route path={ROUTES.designSystem} element={<DesignSystemPage />} />}

      <Route element={<ZoneGuard allow={AuthStatus.LoggedOut} />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ZoneGuard allow={AuthStatus.NeedsSetup} />}>
        <Route element={<SetupLayout />}>
          <Route path={ROUTES.setup} element={<SetupEntryPage />} />
          <Route path={ROUTES.setupAppLock} element={<SetupPinPage />} />
          <Route path={ROUTES.setupRecoveryKey} element={<SetupRecoveryKeyPage />} />
          <Route path={ROUTES.setupRecoveryConfirm} element={<SetupRecoveryConfirmPage />} />
          <Route path={ROUTES.setupRecover} element={<SetupRecoverPage />} />
          <Route path={ROUTES.setupRecovering} element={<SetupRecoveringPage />} />
        </Route>
      </Route>

      <Route element={<ZoneGuard allow={AuthStatus.Locked} />}>
        <Route path={ROUTES.lock} element={<LockPage />} />
      </Route>

      <Route element={<ZoneGuard allow={AuthStatus.Unlocked} />}>
        <Route element={<PrivateLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.passwords} element={<PasswordsPage />} />
          <Route path={ROUTES.notes} element={<NotesPage />} />
          <Route path={ROUTES.passwordNew} element={<PasswordNewPage />} />
          <Route path={ROUTES.passwordDetail} element={<PasswordDetailPage />} />
          <Route path={ROUTES.passwordEdit} element={<PasswordEditPage />} />
          <Route path={ROUTES.noteNew} element={<NoteNewPage />} />
          <Route path={ROUTES.noteDetail} element={<NoteReadPage />} />
          <Route path={ROUTES.noteEdit} element={<NoteEditPage />} />
          <Route path={ROUTES.search} element={<SearchPage />} />
          <Route path={ROUTES.settings} element={<SettingsPage />} />
          <Route path={ROUTES.settingsSync} element={<SettingsSyncPage />} />
          <Route path={ROUTES.settingsSecurity} element={<SettingsSecurityPage />} />
          <Route path={ROUTES.settingsPassword} element={<SettingsPasswordPage />} />
          <Route path={ROUTES.settingsPin} element={<SettingsPinPage />} />
          <Route path={ROUTES.settingsAbout} element={<SettingsAboutPage />} />
          <Route path={ROUTES.settingsAvatar} element={<SettingsAvatarPage />} />
          <Route path={ROUTES.settingsRecoveryKey} element={<SettingsRecoveryKeyPage />} />
        </Route>
      </Route>

      <Route path="*" element={<StatusRedirect />} />
    </Routes>
  );
}
