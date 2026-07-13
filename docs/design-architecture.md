# Design Architecture

## Goal
Keep the marketplace easy to re-skin without rewriting every screen.

## Source of truth
- `packages/design-tokens/src/index.ts` holds semantic colors, radius, spacing, layout, and type scale.
- `web-app` and `admin-web` apply those tokens as CSS variables at startup.
- `mobile-app` should import the same token package for shared semantic values.

## Rules
- Use semantic names like `accent`, `surface`, `border`, `muted`, and `danger`.
- Avoid hardcoding brand color, border color, radius, and layout widths inside screen code unless it is truly component-specific.
- Keep page structure separate from presentation tokens. Screens own behavior; tokens own appearance.
- When a visual redesign is needed, change the token package first, then update only component-specific overrides.

## Current structure
- Public web app: browsing, auth, favorites, create ad, report detail
- Admin web: moderation, reports, catalog management
- Mobile app: end-user browsing and posting
- Backend: API and persistence

## Next architectural step
- Move the remaining mobile style literals onto shared tokens.
- Pull repeated panel/button/card patterns into reusable app-local primitives.
- Keep new features aligned with the same token vocabulary so web, admin, and mobile stay visually synchronized.
