/**
 * Copy from docs/design 01-auth/03-forgot-password. The design mails a 6-digit code; FEATURES.md
 * specifies a mailed link, so "code" is "link" here.
 */
export const FORGOT_COPY = {
  title: "Reset password",
  body: "We'll email you a link to reset it.",
  field: "Account email",
  submit: "Send link",
  busy: "Sending",
  reassurance:
    "Your passwords and notes stay on this phone. Resetting your password doesn't touch them.",
} as const;
