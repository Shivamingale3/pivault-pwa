# 05 Failures and the rest

Screenshots: `../screenshots/states/<id>.light.jpg` and `.dark.jpg`. Shared sizes are in `../components.md`. Replace "PiDrive" with "PiVault" in all copy.

## Severity rule

- **Whole screen** when the app cannot go on (err-01, err-03).
- **Inline banner** next to the thing that failed when one request failed (err-04 to err-08).
- **Sheet** when the user has to choose (err-02, err-09).
- Every failure says what was or was not written, and offers one clear action.
- The vault is on the phone, so a failed request costs sync and media, never the passwords and notes themselves.

Full-screen failures: icon tile (failure variant) top left, title 27/800, body, a key/value panel, then actions pinned at the bottom (primary, outline, small centred footer text).

## err-01-wrong-server-version · App newer than the Pi

- **Kind:** full screen, blocking. The admin has to act.
- **Copy:** "This app is newer than your Pi". "pi.local answers, but it speaks v1.1. This build needs v1.4 or later, and the endpoints it depends on are not there yet."
- **Panel:** "App build" `1.4.0`, "API version" `1.1.3` (destructive), "Endpoint" `pi.local:8000`.
- **Actions:** primary "Check again", outline "Copy these details". Footer "Your vault is untouched. Nothing was read or written."

## err-02-session-expired · Session expired mid-use

- **Kind:** bottom sheet over the screen the user was on, which is faded. Cannot be dismissed without choosing.
- **Copy:** "Your session ran out". "The Pi stopped accepting this session after 30 days. Sign in with your password to carry on — the PIN alone will not do it."
- **Content:** password field (lock icon, placeholder "Password"), primary "Sign in", quiet text action "Sign out instead".

## err-03-decrypt-failure · Vault will not decrypt

- **Kind:** full screen, blocking.
- **Copy:** "This vault will not decrypt". "The Pi handed over your items, but the key on this phone cannot open them. That happens after the password changes somewhere else."
- **Panel:** "Items received" `42`, "Items opened" `0` (destructive), "Key last set" `14 Feb`.
- **Banner:** warning block "Nothing was written. Your data on the Pi is exactly as it was."
- **Actions:** primary "Sign in for a fresh key", outline "Report this to your admin".

## err-04-request-timed-out · Request timed out

- **Kind:** inline, retry in place. Shown on the Passwords list, `bg-canvas`, tab bar stays.
- **Header:** "Passwords", meta "Could not load the list".
- **Banner:** inline failure banner "No answer in 10 seconds" with "Retry".
- **Body:** three skeleton rows, then a dashed info card with a clock icon: "Media needs the server". "Passwords and notes are on this phone and unaffected. Media streams from pi.local, so it waits until the server answers."

## err-05-pi-disk-full · Pi disk full

- **Kind:** sheet over the upload screen.
- **Content:** file card (badge, "tax-2025.zip", "18 MB · stopped at 0%"). Failure panel on `bg-destructive-surface`: heading "Your Pi has no room left", text "MinIO reports 0 bytes free on /mnt/vault. Nothing was uploaded — the file is still only on your phone.", a mono line "238.4 GB USED" left and "0 B FREE" right, and a full destructive bar.
- **Actions:** outline "Free up space" and a disabled "Try again", side by side. Footer "Passwords and notes still save — they are kilobytes, not gigabytes."

## err-06-quota-reached · Account quota reached

- **Kind:** own screen with a back button. The admin sets the limit.
- **Copy:** "You have used all 5 GB". "Your admin set this account's limit. The Pi itself has room — it just will not take more from you until something goes."
- **Card:** "5.00 GB" 21/800 left, mono "100% OF 5 GB" in destructive right, a stacked bar in three shades, and a legend: "Media" `3.7 GB`, "Private area" `960 MB`, "Passwords and notes" `14 MB`.
- **Actions:** primary "Review largest files", outline "Ask your admin for more".

## err-07-permission-denied · Permission denied (403)

- **Kind:** inline, inside a folder screen with a back button and the parent name ("Shared"). `bg-canvas`.
- **Card:** icon tile (failure, lock), heading 17/800 "{Folder} is not yours to open", text "The Pi refused the request with 403. Your account can read Media, but this folder belongs to another user.", a muted panel with "Path" `/media/shared/family` and "Owner" `{owner email}` in mono, and an outline button "Ask {owner} for access".
- **Below:** eyebrow "FOLDERS YOU CAN OPEN" and row cards (DIR badge, name, item count on the right).

## err-08-corrupted-file · Corrupted file

- **Kind:** inline, inside the viewer. `bg-hero` in both themes.
- **Header:** close button, file name, "2.4 MB · 12 Mar 2026".
- **Centre:** tile 76 with a broken-file icon in the destructive colour, heading "This file will not open", text "All 2.4 MB came down from the Pi, but the JPEG data is not readable. The copy in MinIO is likely damaged."
- **Banner:** "Checksum on the Pi does not match the one recorded at upload."
- **Actions:** light filled button "Download the raw bytes", outline button with destructive text and border "Delete it from the Pi".

## err-09-duplicate-name · Duplicate name

- **Kind:** choice sheet, three ways out.
- **Copy:** "{Folder} already has this name". "{file} is already on your Pi. Nothing has been uploaded yet."
- **Compare:** two small cards side by side. "ON THE PI" `1.1 MB` "12 Mar 2026" on `bg-muted`. "THE NEW ONE" `1.4 MB` "Today" with an ink border.
- **Options (icon tile, title, meta, hairlines):** "Keep both" / "Uploads as lease-agreement (2).pdf". "Replace it" / "The old file is gone for good". "Rename first" / "Type a new name, then upload".
- **Bottom:** outline "Cancel the upload".

## ext-01-face-id-unlock · Face ID unlock

- **Kind:** the default way in when Face ID is on.
- **Layout:** centred logo tile, eyebrow "PIVAULT IS LOCKED", then lower a large tile (~134, radius 36, bordered) with the Face ID glyph, title 23/800, body, and a status chip pinned at the bottom.
- **Copy:** "Look at your phone". "Face ID unlocks the vault. The PIN is there if Face ID cannot see you." Chip "{email} · session still valid".

## ext-02-face-id-failed · Face ID failed twice

- **Layout:** same, the tile is the failure variant with a sad face glyph and a destructive border.
- **Copy:** "Face not recognised". "Two tries used. One more and PiVault will ask for your six-digit PIN instead."
- **Actions:** primary "Try Face ID again", outline "Enter PIN instead".
- **Rule:** the PIN screen appears only after Face ID fails three times, or when the user asks for it.

## ext-03-sort-filter · Passwords, sort state

- **Kind:** a state of `vault/02-passwords`, not a separate screen. It is shown after the user taps the "Sort" pill. Otherwise the default screen with the filter field is shown.

- **Header:** "Passwords", meta "42 items · newest use first", search icon button on the right.
- **Pinned tabs under the header:** "Recent", "A–Z", "Weak". They stay in place while the list scrolls.
- **Rows:** row cards (bordered, radius 18, gap 8): avatar, name 15/700, user 12 muted, and the last-used time on the right as a mono eyebrow ("2H AGO", "YESTERDAY", "3 DAYS", "1 WEEK", "2 WEEKS", "1 MONTH").
- The search icon button returns to the default screen with the filter field.

## ext-04-grid-list · Media grid

- **Header:** folder name as the title ("Documents"), meta "6 files · 214 MB on your Pi", grid / list toggle on the right.
- **Grid:** 2 columns, gap 10. Card: radius 18, bordered, a muted top area (h ~76) with the type label in mono, then name 13/700 and size 11.5 muted.
- The toggle switches to the row list of `vault/04-media-file-manager`. The choice is remembered.
