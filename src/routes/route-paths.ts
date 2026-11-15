import { AuthStatus } from "@/enums/auth.enum";

/** Single source for route paths. `/reset-password` must also stay in `PWA_BYPASS_PATHS`. */
export const ROUTES = {
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  setupAppLock: "/setup/app-lock",
  setupRecoveryKey: "/setup/recovery-key",
  lock: "/lock",
  designSystem: "/design-system",
} as const;

/** The one route each auth status is allowed to land on by default. */
export const STATUS_HOME: Record<AuthStatus, string> = {
  [AuthStatus.LoggedOut]: ROUTES.login,
  [AuthStatus.NeedsSetup]: ROUTES.setupAppLock,
  [AuthStatus.Locked]: ROUTES.lock,
  [AuthStatus.Unlocked]: ROUTES.home,
};
