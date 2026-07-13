# Backend

NestJS + TypeScript backend API.

## Responsibilities

- Authentication and JWT
- Users and roles
- Ads, categories, locations
- Image upload metadata
- Favorites and reports
- Admin moderation
- PostgreSQL persistence

## Planned Modules

```text
src
├── auth
├── users
├── ads
├── categories
├── locations
├── favorites
├── reports
├── admin
├── images
├── common
├── config
└── database
```

## API Reference

See `../docs/corrected/07_api_design.md`.

## Database

- Run migrations: `corepack pnpm migration:run`
- Revert last migration: `corepack pnpm migration:revert`
- Seed data: `corepack pnpm seed`
- Readiness check: `GET /api/v1/health/ready`

## Tests

- Run backend tests: `corepack pnpm test`
