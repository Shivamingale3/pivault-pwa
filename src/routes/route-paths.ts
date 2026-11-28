import { AuthStatus } from "@/enums/auth.enum";
import { EntryKind } from "@/enums/vault.enum";

/** Single source for route paths. `/reset-password` must also stay in `PWA_BYPASS_PATHS`. */
export const ROUTES = {
  home: "/",
  passwordNew: "/passwords/new",
  passwordDetail: "/passwords/:id",
  passwordEdit: "/passwords/:id/edit",
  noteNew: "/notes/new",
  noteDetail: "/notes/:id",
  noteEdit: "/notes/:id/edit",
  search: "/search",
  settings: "/settings",
  settingsSync: "/settings/sync",
  settingsSecurity: "/settings/security",
  settingsPassword: "/settings/password",
  settingsPin: "/settings/pin",
  settingsAbout: "/settings/about",
  settingsAvatar: "/settings/avatar",
  settingsRecoveryKey: "/settings/recovery-key",
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

/** Paths for one entry. */
export const entryPath = {
  password: (id: string): string => `/passwords/${id}`,
  passwordEdit: (id: string): string => `/passwords/${id}/edit`,
  note: (id: string): string => `/notes/${id}`,
  noteEdit: (id: string): string => `/notes/${id}/edit`,
} as const;

/** Home keeps the picked list in the address, so Back lands on the same list. Notes is the default. */
export const HOME_SHOW_PARAM = "show";

/** Home showing the notes or the passwords: where "back to the list" goes. */
export const homeList = (kind: EntryKind): string =>
  kind === EntryKind.Note ? ROUTES.home : `${ROUTES.home}?${HOME_SHOW_PARAM}=${kind}`;
