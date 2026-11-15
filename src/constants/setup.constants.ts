export const PIN_MESSAGES = {
  weak: "Pick a PIN that's harder to guess.",
  mismatch: "The PINs didn't match. Start again.",
} as const;

export const SETUP_COPY = {
  pinTitle: "Set up app lock",
  pinDescription: "Choose a 6 digit PIN. You'll use it every time you open PiVault.",
  pinCreate: "Create your PIN",
  pinConfirm: "Confirm your PIN",
  biometricLabel: "Unlock with biometrics",
  biometricHint: "Use your fingerprint, face or device lock instead of typing the PIN.",
  keyTitle: "Save your recovery key",
  keyDescription:
    "This key unlocks your vault on a new device. PiVault never sees it, so if you lose it your data can't be recovered.",
  keySavedLabel: "I've saved my recovery key somewhere safe",
  enterTitle: "Enter your recovery key",
  enterDescription: "Use the recovery key you saved when you first set up PiVault.",
  accountError: "We couldn't load your account on this device.",
} as const;

export const CLIPBOARD_MESSAGES = {
  copied: "Recovery key copied",
  failed: "Couldn't copy. Select the key and copy it by hand.",
} as const;
