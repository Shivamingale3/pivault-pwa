import { AuthStatus } from "@/enums/auth.enum";

/** Single source for route paths. `/reset-password` must also stay in `PWA_BYPASS_PATHS`. */
export const ROUTES = {
  home: "/",
  settings: "/settings",
  settingsSync: "/settings/sync",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  /** Decides where setup continues: the first-time path or the new-phone path. */
  setup: "/setup",
  setupAppLock: "/setup/pin",
  setupRecoveryKey: "/setup/recovery-key",
  setupRecoveryConfirm: "/setup/recovery-key/confirm",
  setupRecover: "/setup/recover",
  setupRecovering: "/setup/recovering",
  lock: "/lock",
  designSystem: "/design-system",
} as const;

/** The one route each auth status is allowed to land on by default. */
export const STATUS_HOME: Record<AuthStatus, string> = {
  [AuthStatus.LoggedOut]: ROUTES.login,
  [AuthStatus.NeedsSetup]: ROUTES.setup,
  [AuthStatus.Locked]: ROUTES.lock,
  [AuthStatus.Unlocked]: ROUTES.home,
};
