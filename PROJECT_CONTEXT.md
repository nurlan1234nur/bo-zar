# Project Context: BO Zar Marketplace

_Repository snapshot reviewed: 2026-07-13. This document describes the code that exists now; older design documents are treated as planning/reference material when they conflict with the implementation. Secret material and environment-variable values are intentionally omitted._

## Project purpose

BO Zar is a centralized classifieds and community marketplace for Bayan-Ulgii residents, including people living in Bayan-Ulgii province and Ulaanbaatar. It supports public discovery of advertisements, authenticated posting and account workflows, and an administrator/moderator workflow for reports, users, ads, and the category catalog.

The runtime architecture is a pnpm monorepo:

```text
Expo mobile app ----\
Public React web ----> NestJS REST API ----> PostgreSQL
Admin React web ----/
```

All three clients use the same `/api/v1` API and shared TypeScript contracts/client helpers.

## Current implementation status

This is a functional MVP rather than only a scaffold. The backend, public web app, admin panel, mobile app, database migrations, seed workflow, shared packages, CI definition, and operations documentation all exist. The public web marketplace is implemented even though some older specifications still call it a future phase.

Verification performed while preparing this file:

- Backend: 9 Jest suites and 29 tests pass.
- Backend Nest build passes.
- Public Vite web production build passes.
- Admin Vite web production build passes.
- Mobile TypeScript check passes when invoked through the mobile app's local TypeScript binary.
- A live database, Docker Compose deployment, browser behavior, and device behavior were not exercised in this review.

## Current features

### Backend and platform

- REST API with a global `/api/v1` prefix and a consistent `{ success, message, data }` success envelope.
- PostgreSQL persistence through TypeORM entities and explicit migrations; schema synchronization is disabled.
- JWT bearer authentication with `USER`, `ADMIN`, and `MODERATOR` roles.
- DTO validation/transform via `class-validator` and a global whitelisting `ValidationPipe`.
- Role guard on all admin routes.
- Configurable CORS allowlist, request IDs, console request timing, and persisted system-event logging.
- Liveness and database-readiness endpoints.
- Local disk image upload and static serving for JPG/JPEG, PNG, and WEBP files; up to 8 files and 5 MB per file.
- Development seed data for roles, locations, categories, subcategories, users, ads, images, and reports. Credentials are deliberately not reproduced here.

### Public marketplace web (`web-app`)

- Browse, paginate, search, filter, and sort ads.
- Filter by category, location, and price; sort by newest, oldest, most viewed, and price.
- Ad detail side panel with seller/contact information.
- Register, log in, log out, validate a restored session, and persist the session locally.
- Add/remove/list favorites.
- Create an ad and optionally upload images.
- Report an ad.
- Light/dark theme persisted locally.
- Responsive Vite/React interface using shared design tokens.

The web app does not currently expose the complete owner workflow available on mobile (notably editing/deleting one's ads and profile/password-reset screens).

### Mobile app (`mobile-app`)

- Expo/React Native app with Home, Search, Create/Edit, Favorites, Profile, Login/Register, and ad detail experiences.
- Category/location/search/sort controls, pull-to-refresh, featured listing, and ad cards.
- Register/login/logout with session persistence in AsyncStorage.
- Create, edit, status-change/soft-delete, and list the current user's ads.
- Pick an image from the device and upload it with an ad.
- Favorite add/remove/list and report submission.
- Phone dialer integration from ad detail.
- Profile display and authenticated workflow gating.

### Admin web (`admin-web`)

- Admin login and locally persisted session validation.
- Dashboard counts for users, all ads, active ads, reports, and active categories.
- User list, text search, status filtering, block, and suspend actions.
- Report list/filter, resolve report, and hide related ad actions.
- Recent admin action log.
- Create, edit, and soft-disable categories and subcategories.
- Light/dark theme persisted locally.

### Shared packages

- `@bozar/shared-types`: API response, user, ad, catalog, report, admin user/log/stat, enum-union, and pagination contracts.
- `@bozar/api-client`: fetch-based authenticated client plus auth, ads, catalog, favorites, reports, images, and admin API factories.
- `@bozar/design-tokens`: shared light/dark semantic color, spacing, radius, typography, and layout tokens.

## Tech stack

| Area | Technology |
|---|---|
| Workspace | pnpm 9 workspaces, Node.js 22 in CI/container definitions |
| Backend | NestJS 10, TypeScript 5.5, TypeORM 0.3, RxJS |
| Database | PostgreSQL 16, TypeORM migrations, `pg` driver |
| Authentication | JWT, Passport JWT, bcrypt, Nest guards/decorators |
| Validation/uploads | class-validator, class-transformer, Multer, local filesystem storage |
| Public/admin web | React 18, React DOM, Vite 6, Lucide icons, CSS |
| Mobile | Expo 54, React Native 0.81, React 19, Expo Image Picker, AsyncStorage, React Navigation packages |
| Testing | Jest 29, ts-jest, Nest testing utilities |
| Delivery/operations | Docker Compose, backend Dockerfile, GitHub Actions, migration/seed scripts |
| Reference UI | A separate Figma-exported Vite prototype with MUI/Radix/Tailwind-related dependencies |

Configuration variable names used by the code include `NODE_ENV`, `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `RUN_MIGRATIONS`, `CORS_ORIGINS`, `IMAGE_STORAGE_PATH`, `ALLOW_SEED_IN_PRODUCTION`, `VITE_API_BASE_URL`, and `EXPO_PUBLIC_API_BASE_URL`. Their values are intentionally excluded.

## Repository and folder structure

```text
.
├── backend/                    NestJS API, entities, migrations, seed, and Jest tests
│   ├── src/
│   │   ├── admin/              Moderation, dashboard, catalog management, admin logs
│   │   ├── ads/                Listing CRUD, query filters, status changes
│   │   ├── auth/               JWT auth, roles, password workflows
│   │   ├── categories/         Public category/subcategory reads
│   │   ├── common/             Response helper, enums, seed catalog data
│   │   ├── database/           Data source, migrations, seed/run/revert scripts
│   │   ├── favorites/          Favorite persistence and API
│   │   ├── health/             Live/ready checks
│   │   ├── images/             Upload metadata and local file endpoints
│   │   ├── locations/          Location reads and child-location lookup
│   │   ├── reports/            User report submission
│   │   ├── system-logs/        General event/request audit records
│   │   └── users/              Current profile and current user's ads
│   └── test/                   Backend, shared client, and frontend-utility unit tests
├── web-app/                    Public React/Vite marketplace
├── admin-web/                  React/Vite admin and moderation panel
├── mobile-app/                 Expo/React Native end-user application
├── packages/
│   ├── api-client/             Shared fetch client and endpoint factories
│   ├── design-tokens/          Shared light/dark design vocabulary
│   └── shared-types/           Cross-client TypeScript contracts
├── docs/                       Current architecture, ops, deployment, and corrected specs
│   └── corrected/              Numbered product/API/schema/sprint source documents
├── corrected_docs/             Older duplicate copy of corrected Markdown specs
├── pdf_new/                    Historical Markdown/PDF requirements and design artifacts
├── Marketplace platform design concepts/
│                                Standalone Figma-exported UI prototype; not in pnpm workspace
├── nginx/                      Placeholder/readme for a future reverse-proxy config
├── uploads/                    Runtime upload directory (ignored; currently empty in snapshot)
├── .github/workflows/ci.yml    Build/test CI workflow
├── docker-compose.yml          PostgreSQL and intended app service topology
├── package.json                Root orchestration scripts
└── pnpm-workspace.yaml         Workspace membership
```

Installed dependencies, pnpm cache data, generated `dist` output, TypeScript build metadata, runtime logs, and uploads are not source-of-truth project code.

## Database models

PostgreSQL IDs are `BIGINT`; TypeORM represents entity IDs as strings internally and API mappers generally convert them to numbers.

| Model/table | Important fields | Relationships and constraints |
|---|---|---|
| `Role` / `roles` | `roleId`, unique enum `roleName` | One role to many users; roles are `USER`, `ADMIN`, `MODERATOR`. |
| `Location` / `locations` | `locationId`, `name`, nullable `parentLocationId`, `type` | One location to many users/ads. Hierarchy is stored as a parent ID, not an ORM self-relation. |
| `User` / `users` | name, unique phone, nullable unique email, password hash, profile image, status, timestamps | Many-to-one role and optional location; one-to-many ads. Status: active, suspended, or blocked. |
| `Category` / `categories` | unique name, icon, description, active flag, created timestamp | One-to-many subcategories and ads. Delete operations currently soft-disable it. |
| `SubCategory` / `subcategories` | category, name, description, active flag | Many-to-one category; one-to-many ads. Delete operations currently soft-disable it. |
| `Advertisement` / `advertisements` | owner, category, optional subcategory/location, title, description, optional numeric price, status, view count, contact phone, timestamps/expiry | Many-to-one user/category/subcategory/location; one-to-many images. Delete is a `DELETED` status. |
| `Image` / `images` | ad, image URL, thumbnail URL, main-image flag, upload timestamp | Many-to-one advertisement. File bytes live on local disk separately from the row. |
| `Favorite` / `favorites` | user, ad, created timestamp | Unique `(user, ad)` pair prevents duplicate favorites. |
| `Report` / `reports` | reporter, ad, reason, comment, status, creation/review fields | Unique `(reporter, ad)` pair. Reasons and statuses are database enums. `reviewedBy` is stored as an ID field rather than an ORM relation. |
| `AdminActionLog` / `admin_action_logs` | admin user, action type, target type/ID, description, timestamp | Records moderation and catalog actions. |
| `SystemEventLog` / `system_event_logs` | event/actor/target data, request ID, method/path/status, message, JSON metadata, timestamp | General auth, ad, and per-request operational audit stream. Added by the second migration. |

There are two migrations: the initial marketplace schema and the later `system_event_logs` table/indexes. Seed execution runs migrations first and is guarded against accidental production use.

## API routes

All routes below are under `/api/v1`. `Public` means no JWT guard; `User` means any valid JWT; `Admin` means `ADMIN` or `MODERATOR`.

| Access | Method and route | Purpose |
|---|---|---|
| Public | `GET /health` | Process liveness. |
| Public | `GET /health/ready` | Database readiness (`SELECT 1`). |
| Public | `POST /auth/register` | Create a user and return JWT/session user. |
| Public | `POST /auth/login` | Login by phone or email. |
| Public | `POST /auth/logout` | Stateless acknowledgement; client discards token. |
| User | `PATCH /auth/change-password` | Verify current password and replace it. |
| Public | `POST /auth/password-reset/request` | Accept a reset request. |
| Public | `POST /auth/password-reset/confirm` | Validate reset token and replace password. |
| User | `GET /users/me` | Current profile. |
| User | `PUT /users/me` | Update name/email/location/profile image. |
| User | `GET /users/me/ads` | Current user's ads. |
| Public | `GET /ads` | Paginated list; supports `page`, `size`, `keyword`, `categoryId`, `subcategoryId`, `locationId`, `minPrice`, `maxPrice`, `status`, and `sort`. |
| Public | `GET /ads/:adId` | Ad detail. |
| User | `POST /ads` | Create an ad. |
| User | `PUT /ads/:adId` | Update an owned ad. |
| User | `DELETE /ads/:adId` | Soft-delete an owned ad. |
| User | `PATCH /ads/:adId/status` | Change an owned ad's status. |
| User | `POST /ads/:adId/images` | Upload up to 8 images. |
| User | `DELETE /images/:imageId` | Delete image metadata. |
| Public | `GET /categories` | Active category list. |
| Public | `GET /categories/:categoryId/subcategories` | Active subcategories for category. |
| Public | `GET /locations` | Location list. |
| Public | `GET /locations/:locationId/children` | Child locations. |
| User | `POST /favorites/:adId` | Add favorite (idempotent at service level). |
| User | `GET /favorites` | List favorite ads. |
| User | `DELETE /favorites/:adId` | Remove favorite. |
| User | `POST /reports` | Report an ad; one report per user/ad pair. |
| Admin | `GET /admin/reports` | List reports. |
| Admin | `GET /admin/users` | List up to 100 users with ad counts. |
| Admin | `PATCH /admin/ads/:adId/hide` | Hide an ad. |
| Admin | `PATCH /admin/users/:userId/block` | Block a user. |
| Admin | `PATCH /admin/users/:userId/suspend` | Suspend a user. |
| Admin | `PATCH /admin/reports/:reportId/resolve` | Resolve a report. |
| Admin | `GET /admin/dashboard/stats` | Aggregate dashboard counts. |
| Admin | `GET /admin/logs` | Latest 20 admin action logs. |
| Admin | `POST /admin/categories` | Create category. |
| Admin | `PUT /admin/categories/:categoryId` | Update category. |
| Admin | `DELETE /admin/categories/:categoryId` | Soft-disable category. |
| Admin | `POST /admin/categories/:categoryId/subcategories` | Create subcategory. |
| Admin | `PUT /admin/subcategories/:subcategoryId` | Update subcategory. |
| Admin | `DELETE /admin/subcategories/:subcategoryId` | Soft-disable subcategory. |

## Completed work

- Monorepo and shared-package setup is complete.
- Core schema, enum types, foreign keys, uniqueness rules, migrations, migration rollback, and development seed are implemented.
- Authentication, current-user profile, password change, and a development-oriented password reset flow are implemented.
- Full core ad workflow is implemented: listing/detail/create/update/soft-delete/status, filtering, sorting, and image upload.
- Favorites, reports, public catalog, location hierarchy, and admin moderation APIs are implemented.
- Public web, admin web, and mobile MVP interfaces are connected to the shared API client.
- Shared type definitions and semantic light/dark design tokens are in use.
- Request/audit logging and health/readiness checks are implemented.
- CI covers backend build/tests, both web builds, and intends to typecheck mobile.
- Run/test, architecture, deployment, and operations documentation exists.

## Known problems and technical debt

### Security and authorization

- Image upload and image deletion require a JWT but do not verify that the current user owns the ad/image. Any authenticated user can target another ad or image ID. Image deletion removes only the database row, not the physical file.
- Public ad listing accepts a caller-supplied `status`, and ad detail has no status restriction. Hidden, deleted, inactive, or expired content may therefore remain publicly queryable/directly accessible.
- Blocking/suspending a user prevents a new login, but JWT validation does not re-read the user/status. An already-issued token remains usable until expiration.
- Logout is client-side/stateless; there is no token revocation or refresh-token/session store.
- Password reset is a scaffold: tokens are deterministic time-window HMAC codes, not persisted/single-use, there is no delivery provider or rate limiting, and the optional request ID is not used during confirmation.
- Upload validation trusts filename extensions rather than inspecting MIME/content. Multer writes the file before the service confirms the target ad exists, which can leave orphaned files.

### Error handling and data integrity

- Several services broadly catch database errors and still return empty, synthetic, or successful responses. Favorites, reports, moderation, locations, users, and dashboard/catalog reads can hide real failures; a report can appear accepted without being persisted.
- Several admin mutations return a success-shaped response even when the target does not exist. Category/subcategory update uses a `NOT_FOUND` data marker instead of an HTTP 404.
- Admin action logging looks up a hard-coded seeded admin account instead of using the authenticated admin/moderator, so audit attribution is incorrect for other staff accounts. Report resolution also does not populate `reviewedBy`.
- Ad details do not increment `viewCount`; “most viewed” sorting therefore relies only on seeded/external values.
- Category `count` is always returned as zero instead of counting active ads.
- Keyword search only performs a title `ILIKE`; description search, PostgreSQL full-text search, and indexed search are absent.
- Foreign keys use `NO ACTION`, and there is no cleanup/orphan policy for uploaded files or dependent records.

### Testing and delivery

- There are no real web, admin, mobile, browser E2E, API integration, migration, or live-PostgreSQL tests. Backend tests mock repositories; frontend utility functions are imported into backend Jest tests.
- Web/admin/mobile package test scripts are placeholders, and mobile lint is a placeholder. ESLint scripts exist but no repository ESLint configuration is present.
- The checked-in CI mobile command currently cannot locate `tsc` in this workspace layout. Mobile typechecking succeeds through `mobile-app/node_modules/.bin`, so CI needs its invocation corrected.
- Docker Compose declares web and admin builds, but neither frontend directory contains a Dockerfile. The compose stack cannot build as written. The `nginx` directory contains only a plan, not a proxy configuration.
- The backend Dockerfile installs the backend package in isolation even though the repository is a pnpm workspace. It should be validated/reworked for reproducible lockfile-based workspace builds.
- Local disk uploads are not durable across stateless/container deployments unless a persistent volume is added. Cloud/object storage is not implemented.
- Runtime logs and TypeScript build-info artifacts are present in the workspace snapshot even though they are generated artifacts; documentation is duplicated across `docs/corrected`, `corrected_docs`, and `pdf_new`.

### Product/UI gaps

- Public web does not yet offer profile editing, password change/reset UI, “my ads,” or edit/delete ad screens.
- Mobile imports shared tokens but still contains many component-specific/literal styles; reusable UI primitives have not been extracted.
- The standalone Figma design prototype includes mock chat/review concepts that are not connected to the production apps or API and should not be mistaken for shipped features.
- No SEO routing/server rendering exists for public listings/details, and the Vite apps are essentially single-page interfaces.

## Planned features and next work

The corrected specifications and sprint plan document the following post-MVP roadmap:

- Real-time chat.
- Push notifications.
- AI/semantic search and a recommendation system.
- Seller verification and ratings/reviews.
- Payments and boosted/promoted ads.
- Cloud/S3-compatible object storage.
- Advanced analytics.
- SEO-friendly public listing/detail pages.
- Further iOS optimization.
- Eventual service separation/microservice architecture if scale requires it.

The docs still list the public React web marketplace as future work, but it is already implemented at MVP level. That roadmap item should be reinterpreted as production hardening, SEO/routing, and feature parity with mobile.

The nearest architecture tasks explicitly called out in current docs are to move remaining mobile styles onto shared design tokens and extract repeated panel/button/card patterns into reusable app-local components. Before adding major features, the highest-priority engineering work is authorization/error-handling hardening, fixing CI and Docker delivery, adding durable image storage/cleanup, and adding integration/E2E coverage.

## Working conventions for future ChatGPT sessions

- Treat implementation plus migrations as the source of truth for current behavior; use `docs/corrected` for intended product behavior.
- Do not treat `corrected_docs`, `pdf_new`, or the Figma-exported prototype as runtime code.
- Keep API changes synchronized across backend DTO/controllers, `packages/shared-types`, `packages/api-client`, and all affected clients.
- Preserve the standard API success envelope and `/api/v1` prefix unless intentionally versioning the API.
- Add schema changes through migrations; do not enable TypeORM synchronization.
- Use shared design tokens first for cross-client visual changes.
- Never commit runtime credentials, environment files, reset tokens, uploaded user data, or secret values.
