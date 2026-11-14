# 01 Auth

Screenshots: `../screenshots/auth/<id>.light.jpg` and `.dark.jpg`. Shared sizes are in `../components.md`. Replace "PiDrive" with "PiVault" in all copy.

Model: the password is the account on the Pi. The PIN is the gate for the app on this device. Demo values in the design (password `letmein123`, PIN `135790`, key `H8YT-2QNX-4KFV-9JB3`) are prototype data only.

Flow: sign in → (first time) set up PIN → recovery key reveal → confirm → home (`vault/01-home-dashboard`). Later opens: Face ID or PIN → sync → home. New phone: sign in → enter recovery key → rebuilding → set up PIN.

## 01-login · Sign in

- **Layout:** brand card at the top (block h 288 including top padding 60 and side padding 14, card radius 26, `bg-hero`, decorative rings and diagonal lines, logo tile 34 radius 12, eyebrow "SELF-HOSTED ON YOUR PI", wordmark 34/800). Use the existing `brand-hero.tsx`. Then padding 24 26 26: title, body, fields, link, error slot, CTA.
- **Copy:** title "Sign in". Body "Your vault lives encrypted on this phone and works offline. Your Pi keeps an encrypted backup and syncs when it can."
- **Fields:** "Email" (mail icon, placeholder `you@email.com`, `type=email`, `autocomplete=email`, no autocapitalise). "Password" (lock icon, placeholder bullets, `autocomplete=current-password`, Show / Hide toggle).
- **Link:** "Forgot password?" right aligned → 03-forgot-password.
- **CTA:** "Sign in". Enter key submits.
- **States:** field focus and invalid as in components. Valid email shows the tick. Caps lock hint under the password. Busy: spinner + "Signing in". Error: form error banner above the CTA with the server message. Success: full-screen overlay "Signed in", then PIN setup if no PIN exists.
- **Behaviour:** email validity is checked on blur. Typing clears the error. The fifth wrong password in a row goes to 02-login-blocked.

## 02-login-blocked · Sign-in paused

- **Layout:** icon tile (lock), title, body, countdown card, the email and password fields shown disabled, disabled "Sign in" button, link pinned at the bottom.
- **Copy:** "Sign-in paused". "Five wrong passwords in a row. The wait gets longer each round to slow down guessing." Card: "TRY AGAIN IN", `0:24`, "Attempt 5 of 5 · next wait 5 min". Link "Reset password instead".
- **Behaviour:** live countdown. Waits escalate 30 s → 5 min → 1 hour, and the caption names the next one. When it reaches zero the form is enabled again. The countdown region is `role="status"` with `aria-live="off"` so it is not read every second.

## 03-forgot-password · Reset password

- **Layout:** back button, title, body, one field, CTA, reassurance text pinned at the bottom (centred, 12/500 muted).
- **Copy:** "Reset password". "Your account lives on your Pi. We'll mail a 6-digit code to the address on it." Field label "Account email". CTA "Send code". Footer "Your vault stays encrypted on this phone throughout. Resetting your password does not touch it."

## 03b-otp-entry · Enter the code

- **Layout:** back button, title, body, six OTP cells, CTA, resend line, info note pinned at the bottom.
- **Copy:** "Enter the code". "Sent to {email} · valid 10 minutes." CTA "Verify code" (busy "Verifying"). "Resend in 0:32", which becomes a "Resend code" link when the 45 s timer ends. Note "The code comes from your own Pi's mailer, so delivery depends on your server being awake."
- **Behaviour:** digits only, max 6. Submitting with fewer than six shows "Enter all six digits." and shakes the cells.

## 03c-new-password · Set a new password

- **Layout:** title, body, two fields, three rule ticks, CTA pinned at the bottom. No back button.
- **Copy:** "Set a new password". "This signs you in on every device that reaches your Pi." "New password" (placeholder "At least 10 characters", Show / Hide). "Confirm password" (placeholder "Type it again"). Rules: "At least 10 characters", "Mixes cases or numbers", "Both entries match". CTA "Save password".
- **Behaviour:** rules update as you type. Rule 2 passes when there is a lowercase letter and also an uppercase letter or a digit. The confirm field border is ink when it matches and destructive when it does not. The CTA is disabled until all three pass.

## 04-unlock-pin · Unlock with PIN or Face ID

- **Layout:** centred logo tile, title, prompt, six PIN cells, "Show PIN" action, error line (reserve 30 px), spacer, keypad with the Face ID key, "Forgot PIN?" link under the keypad.
- **Copy:** "Welcome back, {first name}". Prompt "Enter your 6-digit PIN". While scanning: "Looking for your face…". Toggle "Show PIN" / "Hide PIN". Link "Forgot PIN?".
- **Behaviour:** the sixth digit submits automatically. Wrong PIN: clear, shake, message. Five wrong PINs → 05-pin-lockout. Face ID key starts a scan (glyph pulses), success shows the "Unlocked" overlay. "Forgot PIN?" explains "Resetting a PIN needs your password and a mailed code." and leads to the password route.
- See also `states/ext-01-face-id-unlock` and `ext-02-face-id-failed` for the Face ID first path.

## 05-pin-lockout · PIN entry paused

- **Layout:** centred icon tile (lock), title 23/800, body, countdown card, primary CTA, disabled keypad at the bottom.
- **Copy:** "PIN entry paused". "Five wrong PINs. The wait slows down anyone holding your phone; sign in with your password to skip it." Card: "PIN AVAILABLE IN", `3:55`, "Attempt 5 of 5 · next wait 1 hour". CTA "Sign in with password".

## 06-set-up-pin · Set up PIN

- **Layout:** two-segment step progress, eyebrow, title, body, six cells, warning line, keypad without the Face ID key.
- **Step 1:** "STEP 1 OF 2", "Set your app PIN", "Six digits to reopen PiVault without typing your full password. It only guards this app on this device."
- **Step 2:** "STEP 2 OF 2", "Confirm your PIN", "Enter the same six digits once more so a slip does not lock you out."
- **Behaviour:** cells are always masked here. After six digits step 1 moves to step 2 after ~160 ms. Mismatch: clear step 2, shake, "Those didn't match. Enter the same PIN again." Match: offer to turn on Face ID (a simple yes / not now sheet, not drawn in detail), then continue to the recovery key during first setup.

## 08-recovery-key-reveal · Your recovery key

- **Layout:** eyebrow, title, body, key panel (radius 24, `bg-muted`, 2 x 2 grid of group chips in mono 17/700 on `bg-card`, then "Copy" and "Download" outline buttons side by side), warning block, spacer, checkbox row, CTA.
- **Copy:** "SETUP · STEP 3 OF 3". "Your recovery key". "Shown once, now. Your Pi never receives it, so nobody — not you, not your admin — can look it up later." Warning "Lose this key and a wiped phone means a lost vault. There is no reset, no backup copy, and no way for support to help. Write it down or print it." Checkbox "I've saved it somewhere safe". CTA "Continue".
- **Behaviour:** CTA is disabled until the checkbox is ticked. Copy shows a toast and follows the clipboard-clear rule. Download saves a text file.

## 08b-recovery-key-confirm · Prove you saved it

- **Layout:** back button, title, body, two rows (each: a muted "XXXX" chip for the hidden neighbour group and a mono input), info note, spacer, CTA, text action.
- **Copy:** "Prove you saved it". "Type the second and fourth groups of your recovery key." Labels "Group 2" and "Group 4", placeholder "FOUR CHARACTERS". Note "Crockford Base32, so there is no I, L, O or U to mistype. Lowercase is fine." CTA "Finish setup". Action "Show me the key again" (back to 08).
- **Behaviour:** input is uppercased and limited to four valid characters. CTA enables when both groups match.

## 09-recover-vault · Enter your recovery key

- **Layout:** icon tile (key), title, body, four stacked mono inputs (placeholder "XXXX"), CTA, info note pinned at the bottom.
- **Copy:** "Enter your recovery key". "Signed in as {email}. This phone has no vault key yet, so the sixteen characters are the only way in." CTA "Recover my vault". Note "Paste the whole key into the first box and it splits itself. Without the key, the only way forward is a new empty vault."
- **Behaviour:** uppercase, strip anything outside Crockford Base32 (digits and letters except I, L, O, U). Four characters moves focus to the next box. Pasting more than four into the first box fills all four. A complete group gets an ink border. CTA is disabled until 16 characters. Errors (borders turn destructive): "All sixteen characters are needed." and "That key does not match any vault on this server." with a shake.

## 09b-recovering · Rebuilding your vault

- **Layout:** centred logo tile with eyebrow "KEY ACCEPTED", progress ring with a lock icon, title 23/800, body, stage list panel, small footer text.
- **Copy:** "Rebuilding your vault". "Unwrapping the vault key, then pulling your records down. Do not close the app." Stages: "Vault key unwrapped" (done), "Passwords" `31 of 42`, "Notes and media index" `waiting`. Footer "A new PIN is set once this finishes."
- **Behaviour:** no actions. When done, go to 06-set-up-pin.

## 10-settings-recovery-key · Settings › Recovery key

- **Layout:** `bg-canvas`. Back button with parent name "Security", title, card (2 x 2 masked groups, heading, text, hairline, "Created" row with a mono date), warning block, primary CTA.
- **Copy:** "Recovery key". Card heading "This key cannot be shown again". Text "It was displayed once when you set up this vault and was never sent to your Pi. If you no longer have it, generate a replacement." Row "Created" / `14 Feb 2026`. Warning "Generating a new key retires the old one immediately. Any copy you wrote down stops working, so replace it wherever you keep it." CTA "Generate a new recovery key".
- **Behaviour:** the CTA asks for the PIN, then runs 08 and 08b again with the new key.
