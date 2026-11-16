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
