/** Copy from docs/design 02-vault, 03-crud and 05-states. Media is not part of PiVault, so the files and Media cards are left out. */
export const HOME_COPY = {
  eyebrow: "VAULT UNLOCKED",
  hello: (firstName: string): string => (firstName === "" ? "Hello" : `Hello, ${firstName}`),
  search: "Search passwords, notes",
  passwords: "Passwords",
  notes: "Notes",
  onThisPhone: "ON THIS PHONE",
  recent: "RECENTLY OPENED",
  clear: "Clear",
  openedPassword: (when: string): string => `Password · opened ${when}`,
  openedNote: (when: string): string => `Note · opened ${when}`,
} as const;

export const LIST_COPY = {
  passwordsTitle: "Passwords",
  notesTitle: "Notes",
  passwordsMeta: (count: number): string =>
    `${String(count)} ${count === 1 ? "item" : "items"} · most recent first`,
  passwordsSortMeta: (count: number): string =>
    `${String(count)} ${count === 1 ? "item" : "items"} · newest use first`,
  notesMeta: (count: number): string =>
    `${String(count)} ${count === 1 ? "note" : "notes"} · encrypted on this phone`,
  filter: "Filter this list",
  sort: "Sort",
  tabRecent: "Recent",
  tabAZ: "A-Z",
  tabWeak: "Weak",
  addPassword: "Add a password",
  addNote: "Add a note",
  noMatches: "No matches",
  noMatchesBody: "Try a different search or filter.",
  noWeak: "No weak passwords",
  noWeakBody: "Every password here looks strong enough.",
  passwordsEmpty: "No passwords yet",
  passwordsEmptyBody:
    "Add your first login and it is encrypted here before it ever reaches your Pi.",
  restore: "Restore from Pi backup",
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
  noneBody: "Notes are matched on their title, because the text stays encrypted.",
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
  savedOnPhone: "Saved on this phone · backed up at next sync",
  savedJustNow: "Saved just now",
  saving: "Saving…",
  notSaved: "Not saved yet",
  saveFailed: "Couldn't save",
  customFields: "CUSTOM FIELDS",
  addField: "+ Add field",
  fieldLabel: "Label",
  fieldValue: "Value",
  deletePassword: "Delete this password",
  deleteNote: "Delete this note",
  reroll: "Reroll",
  generatorTitle: "Generate password",
  length: "Length",
  usePassword: "Use this password",
  bodyEncrypted: "Body stays encrypted — search only sees the title",
  noteSaved: "Saved · encrypted",
  noteTitle: "Title",
  noteBody: "Write your note",
  updated: (when: string, words: number): string =>
    `Updated ${when} · ${String(words)} ${words === 1 ? "word" : "words"}`,
  deleteTitle: (kind: string): string => `Delete this ${kind}?`,
  deleteBody:
    "This is permanent. It goes from this phone now and from your Pi at the next sync, and there is no trash to restore from.",
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
