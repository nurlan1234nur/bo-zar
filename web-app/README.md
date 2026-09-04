# Web App

React Vite public marketplace web app.

## Responsibilities

- Public ad browsing
- Search, category/subcategory, location and price filters, sorting, pagination, and shareable URL query state
- Ad detail
- Login/register
- Create advertisements
- Favorite add/remove toggles, a dedicated saved-advertisements view, and reports
- Authenticated profile/password update, all-status My Ads, and owner edit/status/soft-delete actions

## API

Uses the same NestJS backend as `mobile-app`.

The browser paths `/`, `/account`, and `/favorites` are deep-linkable and respond to browser Back/Forward navigation. Account and favorites paths require a valid restored session. Unknown paths render a recoverable 404 view. Password reset UI remains planned separately.

## Checks

- `corepack pnpm --dir web-app test`
- `corepack pnpm --dir web-app build`
- `corepack pnpm --dir web-app lint`

Environment variable:

```env
VITE_API_BASE_URL=<API_BASE_URL>
```
