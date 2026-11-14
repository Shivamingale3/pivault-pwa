# 03 Create, read, update, delete

Screenshots: `../screenshots/crud/<id>.light.jpg` and `.dark.jpg`. Shared sizes are in `../components.md`.

Decisions held in this module: forms autosave and say so instead of having a Save button, the generator is both a dice on the field and a sheet, notes are rich text with checklists, context menus are bottom action sheets, deletion is a confirm dialog with no trash.

Sheets and dialogs are drawn over a dimmed Media screen. Build them with the existing drawer and dialog.

## 01-password-detail · Password detail

- **Header:** back button on the left, "Edit" pill and overflow button on the right.
- **Identity:** avatar 44 with the first letter, name 23/800 ("GitHub"), domain 12.5 muted ("github.com").
- **Field cards:** USERNAME, PASSWORD (bullets, eye toggle, copy), WEBSITE, then custom fields (RECOVERY EMAIL). Each has a copy button.
- **Dates:** two columns of eyebrow and value: CREATED "14 Mar 2024", MODIFIED "2 days ago".
- **Footer chip:** status chip, full width, pinned at the bottom: "Saved on this phone · backed up at next sync".
- **Behaviour:** copy shows a toast and starts the clipboard timer. Edit opens 02. Overflow: delete (12-delete-confirm).

## 02-password-form · Password form (autosave)

- **Header:** back button, status chip on the right ("Saved just now", changes to "Saving…" while typing).
- **Fields (eyebrow labels):** NAME, USERNAME, PASSWORD, WEBSITE. The password field shows the value in mono and has two buttons inside on the right: dice (reroll with the current generator settings) and sliders (open 03-generator-sheet). Under it the strength meter and a label ("Strong").
- **Custom fields:** eyebrow "CUSTOM FIELDS" with "+ Add field" on the right. Each custom field is a muted card with its label (11.5 muted) over its value and a remove button.
- **Bottom:** outline button with destructive text, "Delete this password".
- **Behaviour:** there is no Save button. Changes save after a short pause and the chip confirms it.

## 03-generator-sheet · Generate password

- **Sheet content:** title "Generate password", text action "Reroll" on the right. Read-only mono field with the result. Strength meter. Row "Length" with the value (`16`) on the right, slider under it. Toggle rows with hairlines: "Uppercase letters" / "A–Z", "Numbers" / "2–9", "Symbols" / "!@#$%", "Allow look-alikes" / "l 1 I O 0" (off by default). Primary CTA "Use this password".
- **Behaviour:** every change regenerates the password immediately. The CTA writes it into the form and closes the sheet.

## 04-note-read · Note, read

- **Header:** back button, "Edit" pill, overflow button.
- **Content:** title 23/800, meta "Updated 3 days ago · 214 words", then the rendered body at 15/500, line 1.55: paragraphs with bold, a code block (mono 12.5/600 on `bg-muted`, radius 14, padding 14), a sub-heading 14.5/700, and a checklist. Checked items are struck through and muted. Checkboxes can be ticked in read mode.
- **Footer chip:** "Body stays encrypted — search only sees the title".

## 05-note-editor · Note editor

- **Header:** back button, status chip "Saved · encrypted".
- **Content:** title input 23/800 and body textarea, no borders.
- **Toolbar above the keyboard:** 40 px buttons, radius 12, `bg-muted`: bold, italic, list, checkbox, code, undo, and attach at the far right. The active format is `bg-primary`.
- **Behaviour:** autosaves. The keyboard in the screenshot is the system keyboard, not built.

## 06-upload-pick-source · Add to Documents (sheet)

- **Copy:** title "Add to {folder}". "Files are encrypted on this phone, then a copy uploads to your Pi."
- **Rows (icon tile 40, title 15/700, meta 12 muted, chevron):** "Photos and videos" / "From your camera roll". "Files" / "Documents, archives, keys". "Scan a document" / "Camera, auto-cropped". "Take a photo" / "Straight into the vault".
- **Bottom:** outline button "Cancel".

## 07-upload-progress · Encrypting

- **Header:** title "Encrypting", "Cancel all" pill with destructive text on the right. Meta "3 of 4 done · 24.3 MB · encrypting, then uploading". Overall progress bar.
- **Rows:** file badge, name 15/700, a progress bar under the name, then on the right "Done" with a filled success check, or the percent ("31%") with a cancel button.
- **Bottom note:** info note with a lock icon: "Encryption happens on this phone, then the copy uploads to your Pi. Leaving this screen does not stop it."
- **Failures:** `states/err-05-pi-disk-full`, `err-06-quota-reached`, `err-09-duplicate-name`.

## 08-action-sheet · File actions

Action sheet from components. Header: file badge, name, size. Rows: "Open", "Rename", "Move to folder", "Move to private area", "Export to device", "Delete" (destructive). Separate "Cancel" card.

## 09-new-folder · New folder (dialog)

"New folder". "Created inside {folder}." Field with a counter (`15/40`), focused. Buttons "Cancel" and "Create". Max 40 characters.

## 10-rename · Rename file (dialog)

"Rename file". "The extension stays as it is." Field with the name selected and the fixed extension (`.pdf`) as a muted suffix. Buttons "Cancel" and "Rename".

## 11-move-to-folder · Move items (sheet)

- **Header:** title "Move 2 items", current location on the right in 11.5 muted ("Vault › Documents").
- **Rows:** folder tile 40, name 15/700, count 12 muted, radio on the right. Single choice. Rows: "Vault root", the folders, and "Private area" with meta "Needs PIN".
- **Bottom:** "New folder" outline and "Move here" primary, side by side.
- **Behaviour:** choosing Private area asks for the PIN before moving.

## 12-delete-confirm · Delete (dialog)

- Icon tile with a trash icon, failure variant.
- "Delete 2 items?" "This is permanent. The files go from this phone now and from your Pi at the next sync, and there is no trash to restore from."
- A muted panel lists the file names (12.5/600).
- Buttons "Keep them" (outline) and "Delete" (destructive filled).
- Use the same dialog for passwords and notes with matching wording.

## 13-sort-view · Sort and view (sheet)

- Title "Sort and view".
- Eyebrow "SORT BY", single-choice rows with a check on the selected one: "Recently used", "Name A–Z", "Newest first", "Largest first".
- Eyebrow "VIEW", two choice chips: "List", "Grid".
- Toggle row "Folders first".
- Primary CTA "Done". Selections apply live.
