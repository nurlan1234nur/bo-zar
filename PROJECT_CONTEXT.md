# BO Zar project context

_Latest documentation reorganization review: 2026-07-14. Application source and TypeORM migrations are authoritative for shipped behavior and database structure._

## Purpose

BO Zar is a centralized classifieds marketplace for Bayan-Ulgii residents, including people living in Bayan-Ulgii province and Ulaanbaatar. It supports public discovery, authenticated posting/account workflows, and staff moderation.

## Runtime architecture

```text
Expo mobile app ----\
Public React web ----> NestJS REST API ----> PostgreSQL
Admin React web ----/
```

## Repository layout

- `backend`: NestJS API, TypeORM entities/migrations, seed, and Jest tests
- `web-app`: React/Vite public marketplace
- `admin-web`: React/Vite moderation and catalog panel
- `mobile-app`: Expo/React Native end-user app
- `packages/shared-types`: shared TypeScript contracts
- `packages/api-client`: shared fetch-based REST client
- `packages/design-tokens`: shared light/dark semantic design tokens
- `docs`: canonical documentation and clearly separated historical archives
- `nginx`: planned reverse-proxy area; active configuration is not implemented

The archived Figma export is reference-only and is not part of the runtime workspace.

## Current feature summary

### Backend

- JWT registration/login, current profile, password change, and development-oriented password reset
- Public ad list/detail restricted to ACTIVE, non-expired records; authenticated create/update/status/soft-delete with filters and sorting
- Category, subcategory, and location catalogs
- Favorites and reports
- Owner-only local image upload/delete with JPEG/PNG/WEBP content validation, per-ad limits, UUID filenames, and compensating file/database cleanup
- Admin users/reports/stats/logs, moderation, and catalog management
- Request/event logging plus liveness/readiness endpoints
- Two migrations: initial marketplace schema and system-event logs

### Public web

- Browse/search/filter/sort/detail ads with shareable URL query state
- Responsive indigo/amber marketplace UI with shared semantic tokens, modern search/filter surfaces, category navigation, listing cards, and coordinated account/system states
- Register/login/logout and session restoration
- Favorite add/remove toggles and a dedicated saved-advertisements view, ad creation/image upload, reports, and an authenticated Account view with profile update and all-status My Ads
- Persistent light/dark theme
- Profile, password change, My Ads, and owner ad edit/status/soft-delete actions are implemented; password reset UI remains absent

### Mobile

- Home/search/detail/create/edit/favorites/profile/auth workflows
- Image selection/upload, phone dialer, reports, and owner soft-delete
- AsyncStorage session persistence

### Admin web

- Staff login/session restoration
- Dashboard, user/report filters, moderation, admin logs
- Category and subcategory create/edit/soft-disable
- Persistent light/dark theme

## Technology

- pnpm 9 workspace; Node.js 22 in CI/container declarations
- NestJS 10, TypeScript, TypeORM, PostgreSQL, Passport JWT, bcrypt, Multer
- React/Vite for public/admin web
- Expo/React Native for mobile
- Jest/ts-jest for current automated tests
- Docker Compose and GitHub Actions for intended delivery workflows

## High-priority limitations

- Uploaded image URLs are served directly from public `/uploads` paths without advertisement-status checks; local filesystem storage also lacks a durable multi-instance strategy.
- PostgreSQL does not enforce a single-main-image constraint, and process crashes can still leave image orphans outside the normal compensating-cleanup path.
- Password reset is not a production delivery/session design.
- Several services suppress persistence errors and return empty/synthetic/success-shaped data.
- Admin audit/reviewer attribution is incomplete.
- View counts and category counts are not maintained.
- Client E2E, live-database integration, and migration tests are absent.
- The reviewed Windows environment required a package-local mobile typecheck command; the checked-in GitHub Actions invocation still needs verification on a clean Linux runner. CI failure is not confirmed. See [mobile typecheck troubleshooting](docs/operations/troubleshooting.md#mobile-typecheck-command-fails).
- Full Docker Compose deployment is incomplete because frontend Dockerfiles and nginx configuration are absent.
- Local upload storage needs a durable production strategy.

## Verification baseline

At the latest review:

- Backend: 10 Jest suites and 55 tests passed.
- Backend build passed.
- Public web production build passed.
- Admin web production build passed.
- Package-local mobile TypeScript check passed.
- Workspace lint passes for backend, public web, and admin web; the mobile package still reports lint as pending.

Live PostgreSQL integration, GitHub Actions on a clean Linux runner, browser E2E behavior, containers, and Expo simulators or physical devices were not part of that baseline.

## Documentation

- [Documentation index](docs/README.md)
- [Feature status](docs/product/feature-status.md)
- [System overview](docs/architecture/system-overview.md)
- [Database](docs/architecture/database.md)
- [API](docs/architecture/api.md)
- [Local development](docs/operations/local-development.md)
- [Deployment](docs/operations/deployment.md)
- [Roadmap](docs/planning/roadmap.md)
- [Technical debt](docs/planning/technical-debt.md)

Archived specifications, PDFs, checklists, and prototypes are preserved under `docs/archive`. They document history and intent but do not override current implementation.

## Working rules

- Apply schema changes through migrations; never enable TypeORM synchronization.
- Keep backend contracts, shared types, API client, consumers, tests, and API docs synchronized.
- Start cross-client visual changes in the shared design-token package.
- Never commit or document credentials, environment values, reset tokens, logs, uploaded user data, or private information.
