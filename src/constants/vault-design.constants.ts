/**
 * Copy from docs/design 02-vault and 03-crud, trimmed by the owner: no technical lines (encryption,
 * storage, server) in the UI. The one status worth showing about an item is whether it is synced.
 */
export const HOME_COPY = {
  title: "Home",
  search: "Search passwords, notes",
  show: "Show",
  passwords: "Passwords",
  notes: "Notes",
  add: "Add",
  addTitle: "Add new",
  addPassword: "Password",
  addNote: "Note",
  cancel: "Cancel",
} as const;

export const LIST_COPY = {
  passwordsMeta: (count: number): string => `${String(count)} ${count === 1 ? "item" : "items"}`,
  notesMeta: (count: number): string => `${String(count)} ${count === 1 ? "note" : "notes"}`,
  addPassword: "Add a password",
  addNote: "Add a note",
  passwordsEmpty: "No passwords yet",
  passwordsEmptyBody: "Add your first login to get started.",
  restore: "Sync now",
  notesEmpty: "No notes yet",
  notesEmptyBody: "Recovery codes, licence keys, anything you would not put in a plain notes app.",
  writeNote: "Write a note",
  reveal: "Show password",
  hide: "Hide password",
  copy: "Copy password",
} as const;

export const SEARCH_COPY = {
  placeholder: "Search",
  done: "Done",
  recentSearches: "RECENT SEARCHES",
  passwords: "Passwords",
  notes: "Notes",
  none: "Nothing found",
  noneBody: "Try a different word.",
} as const;

export const CRUD_COPY = {
  edit: "Edit",
  more: "More",
  back: "Back",
  username: "USERNAME",
  password: "PASSWORD",
  website: "WEBSITE",
  notes: "NOTES",
  name: "NAME",
  created: "CREATED",
  modified: "MODIFIED",
  customFields: "CUSTOM FIELDS",
  addField: "+ Add field",
  addUsername: "Username",
  addWebsite: "Website",
  addCustomField: "Custom field",
  fieldLabel: "Label",
  fieldValue: "Value",
  deletePassword: "Delete this password",
  deleteNote: "Delete this note",
  reroll: "Reroll",
  generatorTitle: "Generate password",
  length: "Length",
  usePassword: "Use this password",
  noteTitle: "Title",
  noteBody: "Write your note",
  updated: (when: string): string => `Updated ${when}`,
  deleteTitle: (kind: string): string => `Delete this ${kind}?`,
  deleteBody: "This can't be undone.",
  cancel: "Cancel",
  delete: "Delete",
  gone: "That item no longer exists.",
} as const;

export const GENERATOR_TOGGLES = [
  { key: "uppercase", title: "Uppercase letters", meta: "A–Z" },
  { key: "numbers", title: "Numbers", meta: "2–9" },
  { key: "symbols", title: "Symbols", meta: "!@#$%" },
  { key: "lookAlikes", title: "Allow look-alikes", meta: "l 1 I O 0" },
] as const;

export const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Strong", "Very strong"] as const;

export const FONT_SIZE_COPY = {
  button: "Text size",
  small: "Small",
  medium: "Default",
  large: "Large",
  xlarge: "Extra large",
} as const;

/** The note body's size classes (the line height stays the same at every size). */
export const NOTE_FONT_CLASS = {
  small: "text-[0.8125rem]",
  medium: "text-[0.9375rem]",
  large: "text-[1.125rem]",
  xlarge: "text-[1.375rem]",
} as const;

export const SYNC_MARK_COPY = {
  synced: "Synced",
  notSynced: "Not synced yet",
  saving: "Saving…",
  notSaved: "Not saved yet",
  saveFailed: "Couldn't save",
} as const;
