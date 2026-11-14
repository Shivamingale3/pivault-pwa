# 06 Sync

Screenshots: `../screenshots/sync/<id>.light.jpg` and `.dark.jpg`. Shared sizes are in `../components.md`.

## Sync rules

- Sync runs on app open and never blocks entry to the vault.
- Both failure screens offer "Continue offline" first.
- Offline is a pill, never a screen.
- Progress is always named with stages and counts, never a bare spinner.
- A stopped sync overwrites nothing.
- After sixty seconds it gives up.
- Media stays server-only, so the Media tab greys out while offline. Passwords and notes carry a dot when they hold unsynced edits.

The three blocking screens share a layout: centred logo tile with a mono eyebrow under it (the host), a centred visual, title 23/800, body 13.5 muted centred, a panel, and actions pinned at the bottom.

## 01-syncing · Syncing

- **Kind:** shown on app open after unlock.
- **Eyebrow:** "PI.LOCAL".
- **Visual:** progress ring with the percent in the centre ("30%").
- **Copy:** "Syncing your vault". "Pulling changes · 12 of 40".
- **Panel:** stage list: "Passwords" `42` (done), "Notes" `7 of 12` (active), "Media index" `waiting`. Thin progress bar under it.
- **Footer:** "Keep the app open. This usually takes a few seconds."
- **Next:** 06-sync-complete, or 02 / 03 on failure.

## 02-sync-failed · Couldn't reach your server

- **Eyebrow:** "PI.LOCAL · NO ANSWER" in the destructive colour.
- **Visual:** tile ~104, radius 30, `bg-destructive-surface`, wifi-off icon.
- **Copy:** "Couldn't reach your server". "Your vault still works. Everything you change now is saved on this phone and goes up to pi.local the next time it answers."
- **Panel:** "Last synced" `Today, 08:14`. "Waiting to upload" `3 changes`.
- **Actions:** primary "Continue offline", outline "Try again".

## 03-sync-timed-out · Your server is taking too long

- **Eyebrow:** "PI.LOCAL · GAVE UP AT 60S" in the destructive colour.
- **Visual:** ring ~96 with a 5 px destructive stroke and a clock icon.
- **Copy:** "Your server is taking too long". "pi.local answered but never finished. We stopped after a minute rather than leave you waiting."
- **Panel:** "Got through" `Passwords · 42`. "Stopped during" `Notes · 7 of 12` (destructive). Then a note inside the panel: "Half a sync is safe. Nothing was overwritten, and the rest picks up where it stopped."
- **Actions:** primary "Continue offline", outline "Try again".

## 04-offline · Offline, no sync

- **Kind:** not an error. A normal list (`bg-canvas`) with extra markers.
- **Header:** "Passwords", meta "42 items", search icon button.
- **Pill under the header:** "Offline · changes will sync later".
- **Rows:** row cards as in `states/ext-03-sort-filter`. Items edited since the last sync show the unsynced dot on the right. An edited item's meta reads "Edited offline".
- **Dashed note:** "A dot marks the two items edited since the last sync. They go up on their own once pi.local is back."
- **Tab bar:** Media is greyed and cannot be opened.

## 05-settings-sync · Settings › Sync

- **Header:** back button with parent name "Settings", title "Sync". `bg-canvas`.
- **Status card:** success dot and "Up to date", then "4 min ago" 23/800, then "Today at 09:52 · pi.local" (12.5 muted), then primary CTA "Sync now" (h 56).
- **Eyebrow "WHAT SYNCED":** key/value card: "Passwords" `42 items`, "Notes" `12 notes`, "Media index" `8 files`.
- **Eyebrow "WHEN IT RUNS":** toggle card: "On app open" / "Skipped when you are offline" (on). "Only on Wi-Fi" / "pi.local is on your home network anyway" (off).
- **Behaviour:** "Sync now" opens 01-syncing.

## 06-sync-complete · Vault up to date

- **Kind:** brief confirmation, then the vault opens on its own. `bg-hero` in both themes.
- **Visual:** tile ~110, radius 30, dark teal fill, success check.
- **Copy:** "Vault up to date". "40 items in, 3 changes up. Opening your vault."
- **Chip:** dark pill with a success dot and mono text "PI.LOCAL · 09:56".
