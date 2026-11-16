export const VAULT_DB_NAME = "pivault-vault";

/** Prefix of the authenticated data that ties an encrypted blob to its record id. */
export const ENTRY_AAD_PREFIX = "pivault/entry/";

export const ENTRY_LIMITS = {
  title: 200,
  body: 50_000,
  username: 256,
  password: 1024,
  url: 2048,
  notes: 10_000,
  fieldLabel: 60,
  fieldValue: 1024,
  fields: 20,
} as const;

export const VAULT_MESSAGES = {
  titleRequired: "Give it a title.",
  passwordRequired: "Enter the password.",
  notFound: "That item no longer exists.",
  saveFailed: "Couldn't save to this device. Try again.",
  unreadable: (count: number) =>
    `${String(count)} ${count === 1 ? "item" : "items"} couldn't be decrypted and ${count === 1 ? "is" : "are"} hidden.`,
} as const;

export const CLIPBOARD_MESSAGES = {
  copied: (label: string) => `${label} copied. It clears from the clipboard in 30 seconds.`,
  failed: "Couldn't copy. Select it and copy by hand.",
} as const;
