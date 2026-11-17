/** Copy from docs/design (screens 04-private-settings and 06-sync). The app's name is PiVault. */
export const SETTINGS_COPY = {
  title: "Settings",
  sync: "Sync",
  groupAccount: "ACCOUNT",
  lockNow: "Lock now",
  lockMeta: "Asks for your PIN to open again",
  groupSecurity: "SECURITY",
  groupApp: "APP",
  groupSync: "SYNC",
  changePassword: "Change password",
  changePin: "Change PIN",
  changePinMeta: "Six digits",
  security: "Security",
  securityMeta: "Biometrics, auto-lock, clipboard",
  about: "About",
  syncRow: "Sync",
  signOut: "Sign out",
  footer: (version: string) => `PiVault ${version}`,
} as const;

export const SYNC_COPY = {
  upToDate: "Up to date",
  syncing: "Syncing",
  offline: "Offline",
  problem: "Sync problem",
  ended: "Signed in elsewhere",
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
  body: "Your passwords and notes are removed from this phone. Synced items come back when you sign in again.",
  warning: "You'll need your password and recovery key to sign in again.",
  unsynced: "Items that haven't synced yet will be lost.",
  cancel: "Cancel",
  confirm: "Sign out",
} as const;

/** "1 item", "42 items". */
export const countLabel = (count: number, one: string, many: string): string =>
  `${String(count)} ${count === 1 ? one : many}`;

export const SECURITY_COPY = {
  title: "Security",
  faceId: "Unlock with biometrics",
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
  intro: "You'll use the new password the next time you sign in.",
  current: "CURRENT PASSWORD",
  next: "NEW PASSWORD",
  confirm: "CONFIRM NEW PASSWORD",
  confirmPlaceholder: "Type it again",
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
  version: "Version",
  built: "Built",
  account: "Account",
  checkUpdate: "Check for updates",
  checking: "Checking",
  upToDate: "You have the latest version.",
  updating: "Updating to the latest version…",
  offline: "You're offline. Try again when you're connected.",
} as const;
