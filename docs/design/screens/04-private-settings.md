# 04 Private area and settings

Screenshots: `../screenshots/private-settings/<id>.light.jpg` and `.dark.jpg`. Shared sizes are in `../components.md`. Replace "PiDrive" with "PiVault" in all copy.

Model as built: the vault is encrypted on the phone and works offline. The Pi holds an encrypted backup (Postgres and MinIO). Password = the account on the Pi. PIN = app gate, asked again for the private area. No sign-up, the admin adds users by API. No pairing screen, the server address ships with the build and is shown read-only.

Settings screens use `bg-canvas`, cards on `bg-card`, and no tab bar.

## priv-01-gate · Private area gate

- **Layout:** back button, centred icon tile (lock), title 23/800, body, six PIN cells, spacer, keypad without the Face ID key.
- **Copy:** "Private area". "Enter your app PIN again to open the private area."
- **Behaviour:** always asks for the PIN, whatever the Security settings say. Face ID is not offered here. Wrong PIN behaves as in `auth/04-unlock-pin`.

## priv-02-browse · Private area

- **Header:** "Lock" pill on the left (filled ink, lock icon) that relocks and leaves. "Select" pill and overflow button on the right.
- **Title block:** "Private", then "Private root" (ink 600) "· 7 items · 96 MB" (muted).
- **Rows:** file rows. The meta line starts with a small success dot.
- **FAB:** add files, same sheet as Media.
- **Bottom note:** info note with a lock icon: "Nothing here appears in Media, search, or recents. Locks itself the moment you leave the app."
- **Behaviour:** own folder tree, separate from Media. No tab bar. Relocks when the app goes to the background.

## state-no-sync · Home when the server is unreachable

- Same as `vault/01-home-dashboard` with these changes.
- Under the title: inline failure banner "Can't reach pi.local" with a "Retry" pill.
- The three cards show "Unavailable" in place of their counts and the storage card is gone. The Media card is dimmed.
- A dashed info card with a no-sync icon: heading "Your vault still works", text "Passwords and notes are on this phone and open as usual. Only media needs the server, and nothing syncs until pi.local answers."
- Passwords and Notes still open. Only Media is blocked.

## set-01-settings · Settings

- **Header:** back button and title "Settings" on one line.
- **Profile card:** avatar 44 (ink square, initial), name 15/700, email 12.5 muted, "MEMBER" badge on the right (mono eyebrow in a bordered chip).
- **Groups (eyebrow, then a grouped list card):**
  - ACCOUNT: "Change password" / "Signs you out on other devices". "Change PIN" / "Six digits".
  - SECURITY: "Security" / "Face ID, auto-lock, clipboard". "Private area" / "Asks for your PIN".
  - SERVER: "pi.local" / "Set by your build".
  - APP: "About" / "Version 1.4.0".
- **Footer line:** "PiVault 1.4.0 · pi.local · users are added by your admin" (11.5 muted, centred).
- Two rows are not visible in the screenshot and are confirmed: a "Sync" row in the SERVER group (opens `sync/05-settings-sync`) and a "Sign out" row as the last row on the screen (opens set-06).

## set-02-security · Security

- **Toggle card:** "Unlock with Face ID" / "PIN still works as the fallback" (on). "Hide contents in the app switcher" / "Blanks the preview when you leave the app" (on). "Block screenshots" / "Android only — iOS cannot enforce this" (off).
- **Eyebrow "LOCK THE APP AFTER":** choice chips "Instantly", "1 min" (default), "5 min", "15 min".
- **Eyebrow "CLEAR CLIPBOARD AFTER":** choice chips "15 s", "30 s" (default), "60 s", "Never".
- **Row card:** "Change PIN" with a chevron.
- **Bottom note:** "The private area always asks for your PIN, whatever these settings say."
- Settings apply immediately.

## set-03-change-password · Change password

- **Intro:** "This is your identity on the Pi. Changing it signs you out everywhere else."
- **Fields (eyebrow labels):** CURRENT PASSWORD, NEW PASSWORD (placeholder "At least 10 characters", Show / Hide), CONFIRM NEW PASSWORD (placeholder "Type it again").
- **Rules:** "At least 10 characters", "Mixes cases or numbers", "Both new entries match". Same logic as `auth/03c-new-password`.
- **Bottom:** status chip "Your admin can reset this if you lose it", then primary CTA "Save new password", disabled until the rules pass.

## set-04-change-pin · Change PIN

- **Layout:** header, three-segment step progress, eyebrow, title, body, six cells, keypad without the Face ID key.
- **Steps:** "STEP 1 OF 3" "Current PIN" "Enter the PIN you use now." Then step 2 for the new PIN and step 3 to confirm it, with the wording of `auth/06-set-up-pin`.
- The design text "Demo PIN is 135790." is prototype text and is not built.

## set-05-about · About

- **Top:** centred logo tile 52, name 19/800, "Version 1.4.0 · build 2026.08.11" (12.5 muted).
- **Key/value card:** "Server" `pi.local`, "Account" `{email}`, "Vault encryption" `AES-256-GCM`, "Backup" `Postgres · MinIO`, "API" `FastAPI`. Values in mono, muted, right aligned.
- **Link card:** "Open-source licences", "Privacy and data handling", "Diagnostics log", each with a chevron.
- **Footer:** "Accounts are created by your administrator. There is no public sign-up."

## set-06-sign-out · Sign out (dialog)

- Icon tile, failure variant, sign-out icon.
- "Sign out?" "Your vault is stored on this phone, so signing out removes it from here. The encrypted backup on pi.local is untouched."
- Muted panel with three rows: "×  Session token cleared", "×  PIN removed from this phone", "✓  Vault untouched on pi.local".
- Warning block: "You will need your password to sign in again, then a new PIN."
- Buttons "Cancel" (outline) and "Sign out" (destructive filled).
