/** Copy from docs/design (screens 04-private-settings and 06-sync). The app's name is PiVault. */
export const SETTINGS_COPY = {
  title: "Settings",
  sync: "Sync",
  groupAccount: "ACCOUNT",
  lockNow: "Lock now",
  lockMeta: "Asks for your PIN to open again",
  groupServer: "SERVER",
  syncRow: "Sync",
  signOut: "Sign out",
  footer: (host: string) => `PiVault · ${host} · users are added by your admin`,
} as const;

export const SYNC_COPY = {
  upToDate: "Up to date",
  syncing: "Syncing",
  offline: "Offline",
  problem: "Sync problem",
  ended: "Session ended",
  never: "Not yet",
  syncNow: "Sync now",
  busy: "Syncing",
  whatSynced: "WHAT SYNCED",
  sinceSignIn: "SINCE YOU SIGNED IN",
  passwords: "Passwords",
  notes: "Notes",
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  pillOffline: "Offline · changes will sync later",
  pillSynced: "Synced",
  pillSyncing: "Syncing",
  pillProblem: "Sync problem",
  pillEnded: "Signed in elsewhere",
} as const;

export const SIGN_OUT_COPY = {
  title: "Sign out?",
  body: (host: string) =>
    `Your vault is stored on this phone, so signing out removes it from here. The encrypted backup on ${host} is untouched.`,
  tokenCleared: "Session token cleared",
  pinRemoved: "PIN removed from this phone",
  vaultUntouched: (host: string) => `Vault untouched on ${host}`,
  warning: "You will need your password to sign in again, then a new PIN.",
  unsynced: "Changes that haven't synced yet will be lost.",
  cancel: "Cancel",
  confirm: "Sign out",
} as const;

/** "1 item", "42 items". */
export const countLabel = (count: number, one: string, many: string): string =>
  `${String(count)} ${count === 1 ? one : many}`;
