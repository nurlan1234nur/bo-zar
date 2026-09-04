# System overview

## Runtime architecture

```text
Expo mobile app ----\
Public React web ----> NestJS REST API ----> PostgreSQL
Admin React web ----/
```

All clients use the same versioned API and shared TypeScript packages.

## Monorepo layout

| Path | Responsibility |
|---|---|
| `backend` | NestJS API, authentication, business logic, TypeORM persistence, migrations, seed, tests |
| `web-app` | React/Vite public marketplace |
| `admin-web` | React/Vite moderation and catalog panel |
| `mobile-app` | Expo/React Native end-user application |
| `packages/shared-types` | Cross-client TypeScript contracts |
| `packages/api-client` | Shared fetch-based REST client |
| `packages/design-tokens` | Shared semantic design values |
| `docs` | Canonical documentation and historical archives |
| `nginx` | Planned reverse-proxy location; configuration is not implemented |

The Figma-exported prototype under `docs/archive/early-prototypes` is excluded from the root pnpm workspace and is not a runtime application.

## Backend organization

The backend is a modular NestJS application containing auth, users, ads, categories, locations, favorites, reports, images, admin, health, database, and system-log modules. TypeORM connects to PostgreSQL, loads entities from modules, and runs explicit migrations. Schema synchronization is disabled.

## Cross-cutting behavior

- JWT bearer authentication reloads current user status and role for every protected request; role guards then protect admin routes.
- A global validation pipe transforms and whitelists DTO input.
- Successful API responses use a shared response envelope.
- Request middleware assigns request IDs, logs timing, and records request events.
- Uploaded images are stored on local disk and served as static assets.
- CORS uses a configured allowlist with local-development defaults.
- Health endpoints provide process liveness and database readiness.

## Delivery state

GitHub Actions builds/tests the backend, builds both Vite clients, and intends to typecheck mobile. PostgreSQL and application services are declared in Docker Compose, but full Compose deployment is incomplete because frontend Dockerfiles and nginx configuration are absent. See [Deployment](../operations/deployment.md).
