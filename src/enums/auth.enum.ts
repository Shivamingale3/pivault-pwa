/** Where the user is in the auth journey. Each status owns exactly one route zone. */
export const AuthStatus = {
  /** No session: login, forgot password. */
  LoggedOut: "logged-out",
  /** Session exists but app lock / recovery key are not set up yet. */
  NeedsSetup: "needs-setup",
  /** Set up, but the app is locked (PIN or biometric needed). */
  Locked: "locked",
  /** Unlocked: the private app (home). */
  Unlocked: "unlocked",
} as const;

export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];
