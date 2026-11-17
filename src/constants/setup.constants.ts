/** Copy from docs/design 01-auth (06, 08, 08b, 09, 09b). Where the key is 64 hex characters, not 16, the text says so. */
export const PIN_MESSAGES = {
  weak: "Pick a PIN that's harder to guess.",
  mismatch: "Those didn't match. Enter the same PIN again.",
} as const;

export const SETUP_COPY = {
  step1Eyebrow: "STEP 1 OF 2",
  step1Title: "Set your app PIN",
  step1Body:
    "Six digits to reopen PiVault without typing your full password. It only guards this app on this device.",
  step2Eyebrow: "STEP 2 OF 2",
  step2Title: "Confirm your PIN",
  step2Body: "Enter the same six digits once more so a slip does not lock you out.",
  faceOfferTitle: "Turn on biometric unlock?",
  faceOfferBody: "Unlock PiVault with your fingerprint or face next time. Your PIN still works.",
  faceOfferYes: "Turn on",
  faceOfferNo: "Not now",

  revealEyebrow: "SETUP · STEP 3 OF 3",
  revealTitle: "Your recovery key",
  revealBody:
    "It's the only way back into your vault on a new phone. It's shown once, so save it now.",
  revealWarning:
    "Lose this key and a wiped phone means a lost vault. There is no reset, no backup copy, and no way for support to help. Write it down or print it.",
  revealSaved: "I've saved it somewhere safe",
  revealContinue: "Continue",
  keyFileHeader: "PiVault recovery key",
  keyFileNote: "Keep this file offline. Anyone with this key and your account can open your vault.",

  confirmTitle: "Prove you saved it",
  confirmBody: "Type the second and fourth groups of your recovery key.",
  confirmPlaceholder: "EIGHT CHARACTERS",
  confirmNote:
    "The key is hexadecimal: 0-9 and A-F, so there is nothing to mix up. Lowercase is fine.",
  confirmFinish: "Finish setup",
  confirmBusy: "Finishing",
  confirmShowAgain: "Show me the key again",

  recoverTitle: "Enter your recovery key",
  recoverBody: (email: string): string =>
    `Signed in as ${email}. Enter your recovery key to open your vault on this phone.`,
  recoverSubmit: "Recover my vault",
  recoverBusy: "Checking the key",
  recoverNote: "Paste the whole key into the first box and it fills the rest.",
  recoverIncomplete: "All sixty-four characters are needed.",

  recoveringEyebrow: "KEY ACCEPTED",
  recoveringTitle: "Rebuilding your vault",
  recoveringBody: "Downloading your passwords and notes. Don't close the app.",
  recoveringFooter: "A new PIN is set once this finishes.",
  stageKey: "Recovery key accepted",
  stageRecords: "Passwords and notes",
  stageSaved: "Saved on this phone",
  recoveringFailed: "The vault could not be rebuilt.",
  retry: "Try again",
} as const;

export const KEY_FILENAME = "pivault-recovery-key.txt";
