# Deployment Checklist

## Before deploy

- Confirm `backend/.env` or platform env has `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`.
- Confirm `RUN_MIGRATIONS=true` or run migrations manually first.
- Confirm the database is reachable.
- Confirm the uploads directory exists and is writable.

## Deploy order

1. Build the workspace packages you are shipping.
2. Run backend migrations.
3. Start the backend.
4. Start the web and admin frontends.
5. Verify `GET /api/v1/health` and `GET /api/v1/health/ready`.

## Rollback

1. Stop the app.
2. Revert the last migration if the schema changed.
3. Restore the previous release artifact.
4. Re-run the readiness check after rollback.

## Notes

- Seed is dev-only unless `ALLOW_SEED_IN_PRODUCTION=1`.
- `synchronize` is disabled in the backend runtime path.
