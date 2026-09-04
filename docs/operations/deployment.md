# Deployment

## Current delivery state

The production stack declares PostgreSQL, the NestJS API, public web, admin web, and an Nginx gateway in `docker-compose.prod.yml`. Only the gateway port is published. Database data and uploaded images use named Docker volumes. GitHub Actions builds immutable Docker images, publishes them to Docker Hub, copies the Compose file to the VPS, and restarts the stack.

The container definitions and application builds are ready. A production deployment still requires server secrets, DNS/TLS configuration, and smoke testing on the target VPS.

## One-time VPS setup

1. Install Docker Engine and the Docker Compose plugin.
2. Create `/home/<server-user>/bozar`.
3. Copy the root `.env.example` to `/home/<server-user>/bozar/.env` and replace every placeholder. Keep this file on the server only.
4. Point the public domain's host-level Nginx or load balancer to `http://127.0.0.1:8200` (or the configured `BOZAR_HTTP_PORT`) and terminate TLS there.

```nginx
location / {
    proxy_pass http://127.0.0.1:8200;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## GitHub Actions secrets

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_SSH_PASSWORD`

The VPS `.env` is never copied or overwritten by CI.

## Deployment order

1. Build the workspace artifacts being shipped.
2. Provision/reach PostgreSQL and durable image storage.
3. Apply TypeORM migrations.
4. Start the backend.
5. Verify liveness and database readiness.
6. Deploy the public/admin clients through a supported static-hosting or container path.
7. Verify CORS, API routing, static uploads, authentication, and core workflows.

Pushing `main` performs this automatically after the one-time setup. For manual operations:

```bash
cd /home/<server-user>/bozar
docker compose -f docker-compose.prod.yml --env-file .env ps
docker compose -f docker-compose.prod.yml --env-file .env logs -f --tail=200
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

## Database and seed policy

- Migrations are the only supported schema-change mechanism.
- TypeORM synchronization remains disabled.
- Production seeding requires explicit authorization and the production safeguard.
- Back up data before destructive schema or storage changes.

## Rollback

1. Set `VERSION` in the server `.env` to a previously published commit SHA.
2. Run Compose `pull` followed by `up -d`.
3. Revert the most recent migration only when the migration was designed to be safely reversible.
4. Restore database/storage backups when necessary.
5. Re-run liveness, readiness, and critical workflow checks.

Back up both the `bozar_postgres-data` and `bozar_uploads-data` volumes.

## Production acceptance

- Backend tests/build and both web builds pass.
- Mobile typecheck passes.
- Migrations apply to a clean database and the target database.
- Health and readiness checks pass.
- Auth, ad, favorite, report, upload, and moderation smoke tests pass.
- Uploads survive application restarts/redeployments.
- No development credentials, logs, reset tokens, or uploaded data are included in artifacts.
