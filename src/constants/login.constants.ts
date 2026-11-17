/** Copy from docs/design 01-auth (01-login, 02-login-blocked), with PiDrive -> PiVault. */
export const LOGIN_COPY = {
  eyebrow: "Self-hosted on your Pi",
  title: "Sign in",
  body: "Sign in to open your passwords and notes.",
  passwordPlaceholder: "••••••••",
  forgot: "Forgot password?",
  submit: "Sign in",
  busy: "Signing in",
  signedIn: "Signed in",
  blockedTitle: "Sign-in paused",
  blockedBody:
    "Five wrong passwords in a row. The wait gets longer each round to slow down guessing.",
  tryAgainIn: "TRY AGAIN IN",
  resetInstead: "Reset password instead",
} as const;

export const lockCaption = (attempt: number, perRound: number, nextWait: string): string =>
  `Attempt ${String(attempt)} of ${String(perRound)} · next wait ${nextWait}`;
