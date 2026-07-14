# BO Zar marketplace

BO Zar is a classifieds marketplace for Bayan-Ulgii residents in Bayan-Ulgii and Ulaanbaatar. The repository is a pnpm monorepo containing a NestJS API, public web marketplace, admin panel, Expo mobile app, and shared TypeScript packages.

## Architecture

```text
mobile-app  ----\
web-app     ----> REST API ----> backend ----> PostgreSQL
admin-web   ----/
```

## Workspace

- `backend`: NestJS, TypeORM, PostgreSQL API
- `web-app`: React/Vite public marketplace
- `admin-web`: React/Vite moderation panel
- `mobile-app`: Expo/React Native client
- `packages/shared-types`: shared contracts
- `packages/api-client`: shared REST client
- `packages/design-tokens`: shared visual tokens

## Documentation

- [Documentation index and authority rules](docs/README.md)
- [Current repository context](PROJECT_CONTEXT.md)
- [Feature status](docs/product/feature-status.md)
- [System overview](docs/architecture/system-overview.md)
- [Local development](docs/operations/local-development.md)
- [Roadmap](docs/planning/roadmap.md)

Implementation and TypeORM migrations define shipped behavior and database structure. Files under `docs/archive` are historical/reference-only.

## Common checks

```powershell
corepack pnpm --dir backend test -- --runInBand
corepack pnpm --dir backend build
corepack pnpm --dir web-app build
corepack pnpm --dir admin-web build
.\mobile-app\node_modules\.bin\tsc.CMD -p mobile-app\tsconfig.json --noEmit
```

See [Local development](docs/operations/local-development.md) for database, migration, seed, and application startup workflows. Keep real environment files, credentials, logs, reset tokens, uploads, and private user information out of source control and documentation.
