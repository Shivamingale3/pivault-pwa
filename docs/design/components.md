# Shared components and tokens

All sizes are design px on a 402 px wide frame. Values without a mark come from the design source or the designer's own system notes. Values marked `~` were measured off the screenshots and can be adjusted by a pixel or two to fit the existing scale.

## 1. Colour: design hex to token

Never write these hexes in components. They are listed so a colour seen in a screenshot can be matched to its token in `src/styles/tokens.css`.

| Role                              | Light         | Dark           | Token class                       |
| --------------------------------- | ------------- | -------------- | --------------------------------- |
| Screen background                 | `#ffffff`     | `#101215`      | `bg-background`                   |
| Dashboard / settings background   | `#fbfaf8`     | `#0e0f11`      | `bg-canvas`                       |
| Raised card                       | `#ffffff`     | `#16181c`      | `bg-card`                         |
| Field fill, chips, avatars        | `#f5f4f1`     | `#1c1f23`      | `bg-muted`                        |
| Ink, primary button               | `#101010`     | `#f2f1ee`      | `text-foreground`, `bg-primary`   |
| Text on primary                   | `#fefefe`     | `#101215`      | `text-primary-foreground`         |
| Body copy                         | `#77746e`     | `#7e8085`      | `text-muted-foreground`           |
| Labels, placeholders, idle tabs   | `#a09d97`     | `#9b9ca1`      | `text-subtle`                     |
| Hairlines, card borders           | `#eceae5`     | `#2b2f34`      | `border-border`                   |
| Stronger outline                  | `#d9d6d0`     | `#2b2f34`      | `border-border-strong`            |
| Brand card, keypad, toast, viewer | `#0e0f11`     | `#0e0f11`      | `bg-hero`, `text-hero-foreground` |
| Failure, filled                   | `#c23c1a`     | `#e2603c`      | `bg-destructive`                  |
| Failure text                      | `#8f2b12`     | `#ff9d80`      | `text-destructive-foreground`     |
| Failure surface                   | `#fdeeea`     | `#331a12`      | `bg-destructive-surface`          |
| Success                           | `#0e7c66`     | `#3fb89a`      | `bg-success`, `text-success`      |
| Scrim behind sheets and dialogs   | page tint 72% | near black 74% | `bg-overlay`                      |

Screens that stay dark in both themes: media viewer, corrupted-file viewer, sync complete, and the "Signed in" / "Unlocked" success overlays. They use `bg-hero`.

## 2. Type

Plus Jakarta Sans everywhere. Monospace (`font-mono`) only for eyebrow labels, metadata values, countdowns, the recovery key and generated passwords.

| Style                                         | Spec                                     | Existing class                           |
| --------------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| Screen title                                  | 27 / 800 / line 1.15 / -0.035em          | `text-display`                           |
| Centred gate title (PIN, Face ID, sync)       | 23 / 800 / -0.035em                      |                                          |
| Sheet and dialog title                        | ~21 / 800 / -0.03em                      | "Sheet title" in design-system constants |
| Row title                                     | 15 / 700 / -0.01em                       | "Row title"                              |
| Card title (home, settings rows)              | 14.5 / 700 / -0.02em                     |                                          |
| Body                                          | 14 / 500 / line 1.5, muted               | "Body"                                   |
| Meta                                          | 12.5 / 500, muted                        | "Meta"                                   |
| Field label (auth forms)                      | 12 / 600, ink                            |                                          |
| Eyebrow (section labels, form labels in CRUD) | mono 9.5 / 700 / 0.2em uppercase, subtle | `text-eyebrow`                           |
| Input text                                    | 16.5 / 500                               |                                          |
| Primary button label                          | 16 / 700                                 |                                          |
| Small pill / link label                       | 11.5 to 13 / 700                         |                                          |
| Tab label                                     | 10 / 700 active, 10 / 600 idle           |                                          |
| Countdown                                     | mono 44 / 700 / tabular-nums             |                                          |
| Keypad digit                                  | 29 / 500 / -0.02em                       |                                          |

## 3. Layout

- Horizontal padding: 26 on auth and gate screens, 22 on lists, dashboard and settings.
- Content starts ~40 below the top safe area. Screens with a back button put it there, title below it.
- Bottom-pinned actions sit 26 above the bottom safe area. Use a flex column with a spacer, not absolute positioning.
- Radii: 18 fields, 20 cards, 24 panels, 30 keypad and full pills, 32 sheet top, 28 dialogs.
- Borders are 1.5 px.

## 4. Components

Each entry says which existing file to use or extend.

### Buttons (`ui/button.tsx`)

| Pattern                                            | Spec                                                                                               | Maps to                               |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Primary CTA                                        | h 60, radius 30, `bg-primary`, 16/700, shadow `shadow-float`, pressed scale 0.985                  | `size="xl"` + `shadow-float`          |
| Primary CTA, busy                                  | 15 px spinner (2 px ring) before the label, label changes ("Signing in", "Verifying")              |                                       |
| Primary CTA, disabled                              | `bg-muted`, `text-subtle`, no shadow. Not 50% opacity                                              | add a variant or override `disabled:` |
| Secondary outline                                  | h ~52, full width, 1.5 border, 14.5/700                                                            | `variant="outline"` default size      |
| Destructive filled                                 | as primary, `bg-destructive`                                                                       | `variant="destructive"`               |
| Destructive outline text ("Delete this password")  | outline with `text-destructive-foreground`                                                         | `variant="outline"` + text class      |
| Small pill (Sort, Select, Edit, Retry, Cancel all) | h 38, radius 19, px 14, 1.5 border, 11.5/700, optional 13 px icon                                  | `size="sm"` adjusted to full pill     |
| Text link ("Forgot password?")                     | 13/700, underline, offset 3, padding 14 x 4                                                        | `variant="link"`                      |
| Quiet text action ("Show PIN", "Sign out instead") | 12.5/700, muted, no underline                                                                      | `variant="ghost"`                     |
| Back button                                        | 44 x 44, radius 14, `bg-muted` (on canvas screens: `bg-card` + border), chevron-left 18            | `size="icon-sm"`                      |
| Row icon button (copy)                             | 44 x 44, radius 14, 1.5 border, icon 17                                                            | `variant="outline" size="icon-sm"`    |
| FAB                                                | ~56 circle, `bg-primary`, plus icon, `shadow-float`, 22 from the right edge, ~16 above the tab bar |                                       |

### Fields (`ui/input.tsx`, `ui/input-group.tsx`)

- **Text field:** h 58, radius 18, `bg-muted`, 1.5 transparent border, px 18, gap 10, leading icon 17, text 16.5/500, placeholder `text-subtle`.
- **Focus:** fill switches to `bg-background`, border `border-foreground`. Transition 160 ms.
- **Invalid:** border `border-destructive`. Email is checked on blur only.
- **Trailing text toggle:** "Show" / "Hide", 12.5/700, min 52 x 46 hit area, `aria-pressed`.
- **Valid tick:** 17 px filled circle with a check, shown when the email is well formed.
- **Hint under field:** 11.5/600 muted, e.g. "Caps lock is on" (shown from `getModifierState('CapsLock')`).
- **Disabled field:** same shape, text `text-subtle`, lower contrast (see `auth/02-login-blocked`).
- **Form field in CRUD forms:** eyebrow label above, h ~56, same fill and radius.
- **Field with counter or suffix:** counter "15/40" or fixed ".pdf" in mono 11 on the right. Focused border is ink.
- **Filter field:** h 48, radius 24, `bg-muted`, px 18, search icon 16, 14/500.
- **Home search pill:** h 54, radius 27, `bg-card`, 1.5 border, soft shadow `0 4px 14px` ink at 4%, search icon 17, 14.5/500. It is a button that opens the Search screen.

### PIN and OTP cells (`ui/input-otp.tsx`)

- Six equal cells, gap ~8, h 58, radius 17, 1.5 border, character 22/600.
- Empty: `bg-background`, `border-border`. Next cell to fill: border ink at 35% (light) / 42% (dark). Filled: `bg-muted`, border ink.
- PIN shows a bullet per digit unless "Show PIN" is on. OTP always shows digits.
- Wrong entry: clear, `animate-shake` for ~0.32 s, message below in 12.5/600 `text-destructive-foreground`.
- Set `aria-label` to "N of 6 digits entered".

### Keypad (new component)

- Container: `bg-hero`, radius 30, margin 0 12 12, padding 12 0. In dark theme it sits on the muted surface, see the dark screenshots.
- Grid 3 columns, 1 px hairlines (white at 10%), cells h 80 full width, digit 29/500.
- Pressed cell: white at 14%.
- Bottom row: Face ID key (29 px glyph, pulses while scanning) or empty, then 0, then backspace (26 px icon).
- Disabled (lockout): whole pad at 40% opacity, cells h 74, not focusable.
- Each key is a real `<button>` with an `aria-label`.

### Tiles and avatars

- Icon tile: 54 x 54, radius 19, `bg-muted`, 1.5 border, icon 24 stroke 1.8. Failure variant: `bg-destructive-surface`, icon `text-destructive`.
- Logo tile: 42 x 42, radius 15, `bg-primary` (use the existing `AppLogo`).
- Row avatar: 42 x 42, radius 14, `bg-muted`, letter 16/700.
- File type badge: same box, mono 10/700 label (DIR, PDF, JPG, PEM, ZIP, TXT, HEIC). Images show a blurred thumbnail instead.
- Small glyph tile on home cards: 36 x 36, radius 12. In recents: 34 x 34, radius 11.

### Cards and rows (`ui/card.tsx`)

- Card: radius 20, 1.5 border, `bg-card`, padding 16.
- Dashed card (storage, info): same, border dashed, no fill.
- Grouped list card (settings, about, sync): radius 20, rows divided by hairlines, row h ~66: icon 16, title 14.5/700, meta 12/500 muted, chevron-right.
- Password row: padding 12 8, gap 12, avatar, title 15/700, user 12.5/500 muted, secret mono 13/600, then reveal (44, ghost) and copy (44, outlined).
- Note row: title 15/600, chevron, hairline below, h ~56.
- File row: badge, name 15/700, meta 12.5 muted, overflow button (44), hairline below, h 66 to 70.
- Field card on detail screens: radius 18, 1.5 border, eyebrow label, value 15/500, copy button on the right.
- Key/value panel: radius 18, `bg-muted` or bordered card, label 13/500 muted left, value mono 12.5/700 right. The failing value is `text-destructive`.

### Feedback

- **Form error banner:** radius 14, padding 11 13, `bg-destructive-surface`, 16 px round badge with "!" in `bg-destructive`, text 12.5/600 `text-destructive-foreground`. `role="status" aria-live="polite"`. Reserve its height so the layout does not jump.
- **Warning block:** same colours, triangle icon, radius 16, padding 14.
- **Inline failure banner with action:** `bg-destructive-surface`, radius 16, 6 px dot, text 12.5/600, "Retry" pill (h 30, outlined in destructive) on the right.
- **Info note:** radius 16, `bg-muted`, info icon 16, text 12/500 muted, padding 12 14.
- **Status chip:** pill, `bg-muted`, 6 px `bg-success` dot, 11.5/600 muted ("Saved just now").
- **Offline pill:** same shape, wifi-off icon ("Offline · changes will sync later").
- **Unsynced dot:** 6 px muted dot at the right of a row.
- **Countdown card:** radius 24, `bg-muted`, 1.5 border, padding 22, centred: eyebrow, mono 44 timer, caption 12.5/600 muted.
- **Toast (`ui/sonner.tsx`):** hero surface, used for every copy action.
- **Success overlay:** full screen `bg-hero`, 70 px white circle with a check, label 23/800, appears with rise 0.25 s.
- **Skeleton rows (`ui/skeleton.tsx`):** h ~56, radius 16, `bg-muted`.
- **Progress bar:** h 4, radius 2, track `bg-border`, fill `bg-primary`. Per-file upload bars fill `bg-success` when done. Disk-full bar is `bg-destructive`.
- **Progress ring:** ~76 px, 4 px stroke, percent or icon in the centre.
- **Stage list (sync, recover):** rows with a state circle (done = filled check, active = ring, waiting = faint), label 14/600, count in mono on the right, thin progress bar under the list.
- **Strength meter:** 4 segments ~22 x 3, gap 4, label 11.5 muted.

### Overlays

- **Bottom sheet (`ui/drawer.tsx`):** top radius 32, grabber 38 x 4, `bg-background`, `shadow-sheet`, padding 22 to 24, scrim `bg-overlay`. Title ~21/800.
- **Centre dialog (`ui/dialog.tsx`):** radius 28, 26 from the screen edges, padding ~22. Optional icon tile 44, title ~20/800, body 13.5/500 muted, two equal buttons side by side (h ~52, full pill): outline on the left, primary or destructive on the right.
- **Action sheet:** card radius ~24, 12 from the edges, header row with file badge, rows h ~53 (icon 16, label 15/600), hairlines, destructive row in `text-destructive-foreground`. A separate "Cancel" card below, h 56, 15/700.

### Selection controls

- **Toggle (`ui/switch.tsx`):** 46 x 28, knob ~22. On: `bg-primary` track. Off: `bg-muted` track with border.
- **Choice chips (`ui/toggle-group.tsx`):** equal-width cells, h ~52, radius 16, 1.5 border, 12.5/700. Selected: `bg-primary`, `text-primary-foreground`. Used for lock timeout, clipboard timeout, List / Grid.
- **Pinned tabs (Recent / A-Z / Weak):** container `bg-muted`, radius 16, padding 4, selected segment `bg-primary`.
- **Header view toggle (list / grid):** two 36 x 36 icon buttons inside a `bg-muted` radius 14 container, selected one `bg-primary` (or `bg-card` in the file manager variant).
- **Radio row (move to folder):** 24 px circle on the right, selected = filled ink with a check.
- **Checkbox:** 24 x 24, radius 8, checked = `bg-primary` with a check. In notes, a checked item's text is struck through and muted.
- **Rule tick (password rules):** 18 px circle, passes = filled ink with a check, label turns ink.
- **Slider (generator length):** 4 px track, 18 px ink knob, value in mono on the right of the label row.
- **Step progress (PIN setup, change PIN):** equal segments h 3, gap 6, done and current = ink, rest = border colour. Eyebrow "STEP 1 OF 2" under it.

### Navigation

- **Tab bar:** `bg-background`, 1.5 top border, padding 10 8 plus bottom safe area. Four items: Home, Passwords, Notes, Media. Icon 21 stroke 1.9, label 10. Active = ink and 700. Idle = `text-subtle` and 600. Media is greyed and inert while offline.
- **Screens without the tab bar:** all auth and gate screens, private area, settings and its children, detail and editor screens, search, viewer, upload progress, full-screen failures.
- **Sub-page header (settings children):** back button, then title 19/800 on the same line.
