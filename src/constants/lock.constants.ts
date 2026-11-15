/** The app locks itself after being in the background this long. */
export const AUTO_LOCK_AFTER_MS = 60_000;

export const LOCK_COPY = {
  title: "PiVault is locked",
  description: "Enter your PIN to open your vault.",
  pinLabel: "Enter your PIN",
  biometricButton: "Use biometrics",
} as const;

export const LOCK_MESSAGES = {
  vaultKeyMissing: "This device lost your vault key. Sign in again to restore it.",
  sessionExpired: "Your session expired. Sign in again.",
} as const;

export const wrongPinMessage = (attemptsLeft: number): string =>
  `Wrong PIN. ${String(attemptsLeft)} ${attemptsLeft === 1 ? "try" : "tries"} left before a timeout.`;

export const lockedOutMessage = (countdown: string): string =>
  `Too many attempts. Try again in ${countdown}.`;
