/** The app locks itself after being in the background this long. */
export const AUTO_LOCK_AFTER_MS = 60_000;

/** Copy from docs/design (01-auth 04/05, 05-states ext-01/02). "mailed code" for a PIN reset is adapted: see `forgotBody`. */
export const LOCK_COPY = {
  title: "PiVault is locked",
  welcome: (firstName: string): string => `Welcome back, ${firstName}`,
  welcomeNoName: "Welcome back",
  prompt: "Enter your 6-digit PIN",
  showPin: "Show PIN",
  hidePin: "Hide PIN",
  forgot: "Forgot PIN?",
  scanning: "Looking for your face…",
  unlocked: "Unlocked",
  faceEyebrow: "PIVAULT IS LOCKED",
  faceTitle: "Look at your phone",
  faceBody: "Face ID unlocks the vault. The PIN is there if Face ID cannot see you.",
  faceChip: (email: string): string => `${email} · session still valid`,
  failedTitle: "Face not recognised",
  failedBody: "Two tries used. One more and PiVault will ask for your six-digit PIN instead.",
  tryFaceAgain: "Try Face ID again",
  enterPin: "Enter PIN instead",
  lockoutTitle: "PIN entry paused",
  lockoutBody:
    "Five wrong PINs. The wait slows down anyone holding your phone; sign in with your password to skip it.",
  lockoutLabel: "PIN AVAILABLE IN",
  signInWithPassword: "Sign in with password",
  forgotTitle: "Forgot PIN?",
  forgotBody: "Resetting a PIN needs your password. You'll sign in again and set a new PIN.",
} as const;

/** Face ID failures before the PIN screen takes over. */
export const FACE_TRIES = 3;
/** Failures after which the "Face not recognised" screen shows. */
export const FACE_FAILED_SCREEN_AT = 2;

export const LOCK_MESSAGES = {
  vaultKeyMissing: "This device lost your vault key. Sign in again to restore it.",
} as const;

export const wrongPinMessage = (attemptsLeft: number): string =>
  `Wrong PIN. ${String(attemptsLeft)} ${attemptsLeft === 1 ? "try" : "tries"} left before a timeout.`;
