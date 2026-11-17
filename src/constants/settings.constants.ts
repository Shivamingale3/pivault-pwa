/** Copy from docs/design (screens 04-private-settings and 06-sync). The app's name is PiVault. */
export const SETTINGS_COPY = {
  title: "Settings",
  sync: "Sync",
  groupAccount: "ACCOUNT",
  lockNow: "Lock now",
  lockMeta: "Asks for your PIN to open again",
  groupSecurity: "SECURITY",
  groupApp: "APP",
  changePassword: "Change password",
  changePasswordMeta: "Signs you out on other devices",
  changePin: "Change PIN",
  changePinMeta: "Six digits",
  security: "Security",
  securityMeta: "Face ID, auto-lock, clipboard",
  serverMeta: "Set by your build",
  about: "About",
  aboutMeta: "What runs where",
  member: "MEMBER",
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

export const SECURITY_COPY = {
  title: "Security",
  faceId: "Unlock with Face ID",
  faceIdMeta: "PIN still works as the fallback",
  faceIdUnavailable: "This device can't use biometric unlock",
  lockAfter: "LOCK THE APP AFTER",
  clipboardAfter: "CLEAR CLIPBOARD AFTER",
  changePin: "Change PIN",
  saveFailed: "Couldn't save that setting. Try again.",
} as const;

export const LOCK_CHOICE_LABELS: Record<number, string> = {
  0: "Instantly",
  60000: "1 min",
  300000: "5 min",
  900000: "15 min",
};

/** `null` (never) is keyed as "never" because a chip needs a text value. */
export const CLIPBOARD_CHOICE_LABELS: Record<string, string> = {
  15000: "15 s",
  30000: "30 s",
  60000: "60 s",
  never: "Never",
};

export const CHANGE_PASSWORD_COPY = {
  title: "Change password",
  intro: "This is your identity on the Pi. Changing it signs you out everywhere else.",
  current: "CURRENT PASSWORD",
  next: "NEW PASSWORD",
  confirm: "CONFIRM NEW PASSWORD",
  confirmPlaceholder: "Type it again",
  chip: "Your admin can reset this if you lose it",
  cta: "Save new password",
  busy: "Saving",
  done: "Password changed.",
} as const;

export const CHANGE_PIN_COPY = {
  title: "Change PIN",
  eyebrow: (step: number) => `STEP ${String(step)} OF 3`,
  currentTitle: "Current PIN",
  currentBody: "Enter the PIN you use now.",
  done: "PIN changed.",
} as const;

export const ABOUT_COPY = {
  title: "About",
  server: "Server",
  account: "Account",
  encryption: "Vault encryption",
  encryptionValue: "AES-256-GCM",
  backup: "Backup",
  backupValue: "Postgres",
  api: "API",
  apiValue: "Node · Express",
  footer: "Accounts are created by your administrator. There is no public sign-up.",
} as const;
