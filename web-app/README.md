# Web App

React Vite public marketplace web app.

## Responsibilities

- Public ad browsing
- Search and filters
- Ad detail
- Login/register
- Create advertisements
- Favorite add/remove toggles and reports
- Authenticated profile update and all-status My Ads

## API

Uses the same NestJS backend as `mobile-app`.

Account navigation is intentionally state-based (`browse` / `account`) and has no deep-linkable route. A dedicated saved-advertisements view, owner advertisement management, and password settings are planned separately; favorite toggles alone do not provide a Favorites view.

## Checks

- `corepack pnpm --dir web-app test`
- `corepack pnpm --dir web-app build`

Environment variable:

```env
VITE_API_BASE_URL=<API_BASE_URL>
```
