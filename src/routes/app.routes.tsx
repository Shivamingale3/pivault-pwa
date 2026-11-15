import { Route, Routes } from "react-router";
import { AuthStatus } from "@/enums/auth.enum";
import { DesignSystemPage } from "@/pages/design-system.page";
import { ForgotPasswordPage } from "@/pages/forgot-password.page";
import { HomePage } from "@/pages/home.page";
import { LockPage } from "@/pages/lock.page";
import { LoginPage } from "@/pages/login.page";
import { ResetPasswordPage } from "@/pages/reset-password.page";
import { SetupAppLockPage } from "@/pages/setup-app-lock.page";
import { SetupRecoveryKeyPage } from "@/pages/setup-recovery-key.page";
import { PrivateLayout } from "@/routes/private-layout";
import { ROUTES } from "@/routes/route-paths";
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
        <Route path={ROUTES.setupAppLock} element={<SetupAppLockPage />} />
        <Route path={ROUTES.setupRecoveryKey} element={<SetupRecoveryKeyPage />} />
      </Route>

      <Route element={<ZoneGuard allow={AuthStatus.Locked} />}>
        <Route path={ROUTES.lock} element={<LockPage />} />
      </Route>

      <Route element={<ZoneGuard allow={AuthStatus.Unlocked} />}>
        <Route element={<PrivateLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
        </Route>
      </Route>

      <Route path="*" element={<StatusRedirect />} />
    </Routes>
  );
}
