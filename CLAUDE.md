# PiVault PWA

React 19, TypeScript, Vite, Tailwind v4, shadcn (base-ui) components in `src/components/ui`. Run `npm run check` before calling a change done.

## Design handoff

The UI design lives in `docs/design/`. It is the source of truth for every screen.

Before building or changing any screen:

1. Read `docs/design/README.md` (rules, product behaviour, screen index).
2. Read `docs/design/components.md` (token mapping and shared component sizes).
3. Read only the module file for the screen you are building, in `docs/design/screens/`.
4. Open that screen's two screenshots, `docs/design/screenshots/<module>/<id>.light.jpg` and `.dark.jpg`, and compare your result with them when you finish.

Hard rules:

- The designs say "PiDrive". The app is called **PiVault**. Use PiVault in all UI copy.
- Colours come from the tokens in `src/styles/tokens.css` through Tailwind classes. Do not write hex values in components.
- Reuse and extend the components in `src/components/ui`. Do not style one-off copies inside a screen.
- Build each screen once and make sure it is right in both light and dark themes.
- Copy text in the screen files is exact. Do not reword it.
- Items listed under "Assumed, not drawn" in the README are open questions. Ask before deciding them. "Settled decisions" in the README are final.
- Do not load every screen file or every screenshot at once. Read what the current task needs.
