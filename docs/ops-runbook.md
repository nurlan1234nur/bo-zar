# Ops Runbook

## Services

- Backend: `http://localhost:8080`
- Web app: `http://localhost:5173`
- Admin app: `http://localhost:3001`

## Start

```powershell
corepack pnpm dev:backend
corepack pnpm dev:web
corepack pnpm dev:admin
corepack pnpm dev:mobile
```

## Stop

Use `Ctrl + C` in the terminal that launched the service.

If a port is stuck:

```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

Repeat for `5173` and `3001` as needed.

## Health checks

```powershell
Invoke-WebRequest http://localhost:8080/api/v1/health
Invoke-WebRequest http://localhost:8080/api/v1/health/ready
```

The readiness check requires a live database connection.

## Seed

```powershell
corepack pnpm seed:backend
```

Seed is dev-only by default. In production it is blocked unless:

```powershell
$env:ALLOW_SEED_IN_PRODUCTION="1"
```

## Migrations

```powershell
corepack pnpm --dir backend migration:run
corepack pnpm --dir backend migration:revert
```

Backend startup can also auto-run migrations when `RUN_MIGRATIONS=true`.

## Production environment

Required:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

Recommended:

- `PORT`
- `DB_PORT`
- `CORS_ORIGINS`
- `IMAGE_STORAGE_PATH`
- `JWT_EXPIRES_IN`
- `RUN_MIGRATIONS`
