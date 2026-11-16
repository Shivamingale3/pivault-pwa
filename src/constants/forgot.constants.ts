/**
 * Copy from docs/design 01-auth/03-forgot-password. The design mails a 6-digit code; FEATURES.md
 * specifies a mailed link, so "code" is "link" here.
 */
export const FORGOT_COPY = {
  title: "Reset password",
  body: "Your account lives on your Pi. We'll mail a link to the address on it.",
  field: "Account email",
  submit: "Send link",
  busy: "Sending",
  reassurance:
    "Your vault stays encrypted on this phone throughout. Resetting your password does not touch it.",
} as const;
