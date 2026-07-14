# Deployment

## Current delivery state

- PostgreSQL and intended application services are declared in Docker Compose.
- The backend has a multi-stage Dockerfile.
- Public web and admin web do not currently have Dockerfiles, so the full Compose stack cannot build as declared.
- The nginx directory contains a planning README but no active proxy configuration.
- Local image storage requires a persistent writable volume in any container deployment.
- GitHub Actions builds/tests the backend and builds both web clients. The checked-in mobile typecheck command has not been verified on a clean Linux runner during this review; CI failure is not confirmed. See [mobile typecheck troubleshooting](troubleshooting.md#mobile-typecheck-command-fails).

Do not describe the repository as a complete production deployment until these gaps are resolved and verified.

## Required configuration

Production must provide database connection fields, JWT configuration, CORS origins, migration policy, and image-storage configuration through the deployment platform. Variable names belong in sanitized examples; values and secrets do not belong in documentation or source control.

## Deployment order

1. Build the workspace artifacts being shipped.
2. Provision/reach PostgreSQL and durable image storage.
3. Apply TypeORM migrations.
4. Start the backend.
5. Verify liveness and database readiness.
6. Deploy the public/admin clients through a supported static-hosting or container path.
7. Verify CORS, API routing, static uploads, authentication, and core workflows.

## Database and seed policy

- Migrations are the only supported schema-change mechanism.
- TypeORM synchronization remains disabled.
- Production seeding requires explicit authorization and the production safeguard.
- Back up data before destructive schema or storage changes.

## Rollback

1. Stop or drain affected application traffic.
2. Restore the previous application artifact.
3. Revert the most recent migration only when the migration was designed to be safely reversible.
4. Restore database/storage backups when necessary.
5. Re-run liveness, readiness, and critical workflow checks.

## Production acceptance

- Backend tests/build and both web builds pass.
- Mobile typecheck passes.
- Migrations apply to a clean database and the target database.
- Health and readiness checks pass.
- Auth, ad, favorite, report, upload, and moderation smoke tests pass.
- Uploads survive application restarts/redeployments.
- No development credentials, logs, reset tokens, or uploaded data are included in artifacts.
