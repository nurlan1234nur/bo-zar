# Design system

## Source of truth

`packages/design-tokens/src/index.ts` defines shared semantic colors, spacing, radius, typography, and layout values. Production apps may add component-specific styles, but shared visual decisions should start with this package.

## Current integration

- Public web maps light/dark tokens to CSS variables and persists theme choice.
- Admin web maps light/dark tokens to CSS variables and persists theme choice.
- Mobile imports shared tokens but still contains many component-specific literal styles.

## Rules

- Prefer semantic names such as `accent`, `surface`, `border`, `muted`, `success`, and `danger`.
- Do not duplicate shared brand colors, radii, spacing, or layout widths in screen code.
- Keep screen behavior separate from presentation tokens.
- Change shared tokens first for cross-application redesigns.
- Extract repeated card, panel, button, field, and status patterns into app-local reusable components.
- Maintain readable contrast, keyboard/focus behavior on web, and accessible touch targets on mobile.
- Treat archived prototype themes as inspiration only.

## Next design-system work

- Move remaining reusable mobile style literals onto semantic tokens.
- Keep the design-token package README synchronized whenever tokens, usage guidance, or supported clients change.
- Extract repeated UI primitives from the large client entry files.
- Document accessibility checks as components are extracted.
