# PiVault design handoff

Source: the "PiDrive PWA" design project (6 modules, 63 phone screens, light and dark). This folder is the reference for building the UI. Read this file first, then only the module file and screenshots for the screen you are building.

## Files

| File                                    | What it holds                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------ |
| `components.md`                         | Token mapping and exact sizes for every shared component. Read before building any screen. |
| `screens/01-auth.md`                    | Sign in, lockouts, password reset, PIN, recovery key (13 screens)                          |
| `screens/02-vault.md`                   | Home, passwords, notes, media, search, viewer, empty states (9)                            |
| `screens/03-crud.md`                    | Detail and edit screens, sheets, dialogs (13)                                              |
| `screens/04-private-settings.md`        | Private area, settings, sign out (9)                                                       |
| `screens/05-states.md`                  | Failure screens, Face ID, sort/filter, grid/list (13)                                      |
| `screens/06-sync.md`                    | Sync screens and offline state (6)                                                         |
| `screenshots/<module>/<id>.<theme>.jpg` | One image per screen per theme (126 files)                                                 |

## Rules for using this handoff

1. **Name.** The designs say "PiDrive". The app is **PiVault**. Replace the name everywhere it appears in copy, including the wordmark and "PIDRIVE IS LOCKED". Sample data such as `shivam@pidrive.app` is placeholder data, not product copy.
2. **Colour comes from tokens, never from hex.** `src/styles/tokens.css` already holds every design colour for both themes. Use the Tailwind token classes (`bg-background`, `text-muted-foreground`, `border-border`, `bg-destructive-surface`, ...). Dark theme is the same layout with the `.dark` tokens, so build once and check both screenshots.
3. **Reuse what exists.** `src/components/ui` already has button, input, input-group, input-otp, drawer, dialog, switch, toggle-group, sonner, skeleton, badge, card, label, separator. `components.md` says which one each design pattern maps to. Extend variants there instead of writing one-off styles in a screen.
4. **Icons.** The designs draw their own small SVG glyphs. Use the closest `lucide-react` icon at the size given in `components.md`.
5. **Screenshots are scaled.** Each image is the 402 x 874 design frame captured at 0.786 scale (316 px wide). To turn a distance measured on a screenshot into design px, multiply by 1.27. Sizes written in `components.md` and the screen files are already design px.
6. **When sources disagree.** Token values win for colour. `components.md` wins for size. The screenshot wins for layout and order. Copy text in the screen files is exact, apart from the PiDrive to PiVault rename.
7. **Target.** Mobile PWA. The phone frame, status bar, dynamic island and home indicator in the screenshots are device chrome and are not built. Respect safe areas with `env(safe-area-inset-*)`.
8. **Touch targets.** Every control clears 44 px.
9. **Motion.** Use the existing `animate-rise` (things appearing), `animate-shake` (wrong input), `animate-pulse-soft` (waiting). Reduced motion is already handled globally.

## Product rules the UI depends on

- **Architecture.** The vault is stored encrypted on the phone and works fully offline. A Raspberry Pi on the home network (FastAPI, Postgres, MinIO for media) holds an encrypted backup and syncs when reachable.
- **Identity.** The password is the account on the Pi. There is no sign-up. An admin creates users through the API.
- **The gate.** Face ID unlocks the app. The six-digit PIN is the fallback after three Face ID failures. The PIN also guards the private area on its own, always.
- **Lockouts.** Five wrong passwords (or PINs) start an escalating cooldown: 30 seconds, then 5 minutes, then 1 hour. The countdown is live and names the next wait.
- **Recovery key.** Sixteen Crockford Base32 characters shown as `XXXX-XXXX-XXXX-XXXX`. Shown once at setup and never sent to the Pi. It is the only way back into the vault on a new phone. A replacement can be generated, which retires the old one.
- **Sync.** Runs on app open and never blocks the way in. Failure and offline both leave a path to the vault. Offline is a status pill, not a screen. A stopped sync overwrites nothing and gives up after 60 seconds.
- **Private area.** Invisible outside its PIN gate (not in Media, search or recents). Has its own folder tree. Relocks when the app is left.
- **Saving.** Passwords and notes autosave as you type and say so with a chip. There is no Save button on those forms. Notes take bold, lists, checkboxes and code.
- **Copying.** Every copy action shows a toast. The clipboard clears itself after 30 seconds (configurable in Security).
- **Deleting.** Permanent, behind a confirm dialog. No trash, no undo.
- **Failures.** Full screen when the app cannot go on. Inline banner when one request failed. Bottom sheet when the user has to choose. Every failure says what was (or was not) written and offers one clear action.
- **Host.** `pi.local` is set at build time and shown read-only. There is no pairing screen.
- **Media.** Media is server-only, so the Media tab greys out while offline. Thumbnails stay blurred until opened in the viewer.

## Screen index

`id` is also the screenshot file name: `screenshots/<module>/<id>.light.jpg` and `.dark.jpg`.

| Module           | id                          | Screen                                       |
| ---------------- | --------------------------- | -------------------------------------------- |
| auth             | 01-login                    | Sign in                                      |
| auth             | 02-login-blocked            | Sign-in paused (password lockout)            |
| auth             | 03-forgot-password          | Reset password, enter email                  |
| auth             | 03b-otp-entry               | Reset password, enter mailed code            |
| auth             | 03c-new-password            | Reset password, set new password             |
| auth             | 04-unlock-pin               | Unlock with PIN or Face ID                   |
| auth             | 05-pin-lockout              | PIN entry paused                             |
| auth             | 06-set-up-pin               | Set up PIN (enter, confirm, biometric offer) |
| auth             | 08-recovery-key-reveal      | Recovery key shown once                      |
| auth             | 08b-recovery-key-confirm    | Prove the key was saved                      |
| auth             | 09-recover-vault            | Enter recovery key on a new phone            |
| auth             | 09b-recovering              | Rebuilding the vault                         |
| auth             | 10-settings-recovery-key    | Settings, recovery key                       |
| vault            | 01-home-dashboard           | Home dashboard                               |
| vault            | 02-passwords                | Passwords list                               |
| vault            | 03-notes                    | Notes list                                   |
| vault            | 04-media-file-manager       | Media file manager                           |
| vault            | 05-search                   | Search                                       |
| vault            | 06-media-viewer             | Media viewer                                 |
| vault            | e1-passwords-empty          | Passwords, empty                             |
| vault            | e2-notes-empty              | Notes, empty                                 |
| vault            | e3-media-empty              | Media, empty                                 |
| crud             | 01-password-detail          | Password detail                              |
| crud             | 02-password-form            | Password form (autosave)                     |
| crud             | 03-generator-sheet          | Password generator sheet                     |
| crud             | 04-note-read                | Note, read                                   |
| crud             | 05-note-editor              | Note editor                                  |
| crud             | 06-upload-pick-source       | Upload, pick source sheet                    |
| crud             | 07-upload-progress          | Upload progress                              |
| crud             | 08-action-sheet             | File action sheet                            |
| crud             | 09-new-folder               | New folder dialog                            |
| crud             | 10-rename                   | Rename dialog                                |
| crud             | 11-move-to-folder           | Move to folder sheet                         |
| crud             | 12-delete-confirm           | Delete confirm dialog                        |
| crud             | 13-sort-view                | Sort and view sheet                          |
| private-settings | priv-01-gate                | Private area PIN gate                        |
| private-settings | priv-02-browse              | Private area browser                         |
| private-settings | state-no-sync               | Home when the server is unreachable          |
| private-settings | set-01-settings             | Settings home                                |
| private-settings | set-02-security             | Security                                     |
| private-settings | set-03-change-password      | Change password                              |
| private-settings | set-04-change-pin           | Change PIN                                   |
| private-settings | set-05-about                | About                                        |
| private-settings | set-06-sign-out             | Sign out dialog                              |
| states           | err-01-wrong-server-version | App newer than the Pi (full screen)          |
| states           | err-02-session-expired      | Session expired (sheet)                      |
| states           | err-03-decrypt-failure      | Vault will not decrypt (full screen)         |
| states           | err-04-request-timed-out    | Request timed out (inline)                   |
| states           | err-05-pi-disk-full         | Pi disk full (sheet)                         |
| states           | err-06-quota-reached        | Account quota reached                        |
| states           | err-07-permission-denied    | Permission denied, 403                       |
| states           | err-08-corrupted-file       | Corrupted file in viewer                     |
| states           | err-09-duplicate-name       | Duplicate name (choice sheet)                |
| states           | ext-01-face-id-unlock       | Face ID unlock                               |
| states           | ext-02-face-id-failed       | Face ID failed twice                         |
| states           | ext-03-sort-filter          | Passwords with sort and filter tabs          |
| states           | ext-04-grid-list            | Media grid view                              |
| sync             | 01-syncing                  | Syncing on app open                          |
| sync             | 02-sync-failed              | Sync failed                                  |
| sync             | 03-sync-timed-out           | Sync timed out                               |
| sync             | 04-offline                  | Offline pill on a list                       |
| sync             | 05-settings-sync            | Settings, Sync                               |
| sync             | 06-sync-complete            | Sync complete                                |

## Assumed, not drawn

The screen files describe a few behaviours that the designs imply but do not show. Treat these as suggestions and confirm with the developer before relying on them.

- `auth/03b-otp-entry`: the resend line turning into a "Resend code" link when the timer ends.
- `auth/06-set-up-pin`: the Face ID offer after the PIN is confirmed (the design only flags that an offer appears).
- `auth/10-settings-recovery-key`: asking for the PIN before generating a new key, and reusing the reveal and confirm screens.
- `vault/01-home-dashboard`: the logo tile opening Settings.
- `vault/04-media-file-manager`: select mode and the contents of the header overflow menu.
- `vault/05-search`: how results are grouped once the user types.
- `crud/01-password-detail`: what the overflow menu holds.
- `crud/02-password-form`: the "Saving…" state of the status chip.
- `private-settings/set-04-change-pin`: the wording of steps 2 and 3.
- `states/ext-04-grid-list`: remembering the grid or list choice.

## Settled decisions

These were open in the designs and have been decided by the developer.

1. **Home.** `vault/01-home-dashboard` is the only home screen.
2. **Passwords list.** `vault/02-passwords` is the default screen (Sort pill, filter field, rows with reveal and copy). Tapping the Sort pill switches the list to the state in `states/ext-03-sort-filter` (pinned Recent / A-Z / Weak tabs, card rows with a last-used time). Leaving sort returns to the default screen.
3. **Settings rows.** "Sync" sits in the SERVER group. "Sign out" is the last row on the screen.
