# 02 Vault

Screenshots: `../screenshots/vault/<id>.light.jpg` and `.dark.jpg`. Shared sizes are in `../components.md`.

Decisions held in this module: search is its own screen, passwords sort by recent use, copy clears the clipboard after 30 seconds, thumbnails stay blurred until the viewer, and the private area is reachable only from the Media overflow menu (and Settings) and asks for the PIN again.

All four list screens share the tab bar. Top padding is ~38 below the safe area, side padding 22.

## 01-home-dashboard · Home

- **Background:** `bg-canvas`.
- **Header:** eyebrow "VAULT UNLOCKED", title "Hello, {first name}" (27/800, -0.04em), logo tile 42 on the right (opens Settings).
- **Search pill:** "Search passwords, notes, files". Opens 05-search.
- **Card grid:** 2 columns, gap 10, min height 96. Cards: Passwords "42 items", Notes "12 notes", Media "8 files · 214 MB". Each has a 36 px glyph tile, title 14.5/700, count 12/500 muted, and presses to scale 0.985. Fourth cell is a dashed card: eyebrow "ON THIS PHONE", "312 MB" 17/700, storage bar.
- **Recents:** eyebrow "RECENTLY OPENED" with a "Clear" text action. Rows: 34 px glyph tile, title 14/600, meta 11.5 muted ("Password · opened 12 min ago", "Note · opened yesterday", "File · opened 2 days ago").
- **Tab bar:** Home active.
- **Server unreachable variant:** see `private-settings/state-no-sync`.

## 02-passwords · Passwords

- **Header:** title "Passwords", meta "42 items · most recent first", "Sort" pill on the right. This is the default screen. Tapping "Sort" switches to the sort state in `states/ext-03-sort-filter`.
- **Filter field:** "Filter this list". Filters as you type.
- **Rows:** password row from components. Secret is shown as bullets in mono. Eye button toggles reveal for that row (`aria-pressed`). Copy button copies the password, shows a toast and starts the clipboard clear timer. Tapping the row opens `crud/01-password-detail`.
- **Tab bar:** Passwords active.
- **Empty:** e1-passwords-empty. **Load failure:** `states/err-04-request-timed-out`. **Sort state:** `states/ext-03-sort-filter`.

## 03-notes · Notes

- **Header:** title "Notes", meta "12 notes · encrypted on this phone".
- **Filter field**, then note rows (title and chevron, hairline). Tapping opens `crud/04-note-read`.
- **FAB** creates a note (`crud/05-note-editor`).
- **Tab bar:** Notes active. **Empty:** e2-notes-empty.

## 04-media-file-manager · Media

- **Header:** title "Media", breadcrumb under it ("Vault › Documents", current folder in ink 600), "Select" pill and an overflow icon button on the right.
- **Toolbar line:** eyebrow "14 ITEMS · 214 MB" on the left, list / grid toggle on the right.
- **Rows:** file rows. Folders show a DIR badge and "6 items". Images show a blurred thumbnail. Each row has an overflow button that opens `crud/08-action-sheet`.
- **FAB** opens `crud/06-upload-pick-source`.
- **Select mode:** rows get a selection circle and bulk actions (move, delete) replace the header actions. Not drawn in detail, follow the move and delete sheets in CRUD.
- **Overflow menu:** sort and view (`crud/13-sort-view`), new folder, private area.
- **Tab bar:** Media active. **Empty:** e3-media-empty. **Grid view:** `states/ext-04-grid-list`.

## 05-search · Search

- **Layout:** no tab bar. Search field (h 48, full pill, `bg-muted`, autofocus) with a "Done" text button on the right. Under it eyebrow "RECENT SEARCHES" and rows: clock icon, term 15/600, scope on the right in 11.5 muted ("all", "files", "notes", "passwords"), hairlines.
- **Behaviour:** typing filters real results across passwords, notes and files, grouped by type. Notes are matched on title only because the body stays encrypted. Private area items never appear. "Done" goes back.

## 06-media-viewer · Media viewer

- **Surface:** `bg-hero` in both themes, light text.
- **Header:** back button, file name 15/700, meta "2.4 MB · 3024×4032", overflow button.
- **Body:** the image fills the space with radius 20 and starts blurred, with a centred eye button and "Tap to reveal". Tapping shows the image.
- **Bottom bar:** five icon and label actions: Export, Hide, Move, Info, Delete. Delete is in the destructive colour and opens `crud/12-delete-confirm`. Hide blurs the image again.
- **Failure:** `states/err-08-corrupted-file`.

## Empty states

All three: title at the top as usual, then a centred block (icon tile, heading 19/800, body 13.5 muted, actions), tab bar at the bottom.

| id                 | Heading            | Body                                                                                                                                   | Actions                                                  |
| ------------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| e1-passwords-empty | "No passwords yet" | "Add your first login and it is encrypted here before it ever reaches your Pi."                                                        | Pill CTA "Add a password", link "Restore from Pi backup" |
| e2-notes-empty     | "No notes yet"     | "Recovery codes, licence keys, anything you would not put in a plain notes app."                                                       | Pill CTA "Write a note"                                  |
| e3-media-empty     | "No files yet"     | "Import documents and photos, or make a folder first. Files are encrypted on this phone, and a copy goes to your Pi at the next sync." | Pill CTA "Import files", outline pill "New folder"       |

The pill CTA here is content width, h ~52, with `shadow-float`.
