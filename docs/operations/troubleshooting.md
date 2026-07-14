# Troubleshooting

## Backend will not start

- Confirm required configuration names are present in the local environment without printing their values.
- Confirm PostgreSQL is running and reachable.
- Apply pending migrations.
- Check the readiness route after startup.
- Review local logs privately; do not paste credentials, tokens, user data, or upload contents into issues/docs.

## Readiness fails

- Check the PostgreSQL service/container status.
- Confirm the configured database host is reachable from the backend process/container.
- Confirm the target database and user exist and migrations completed.
- The readiness route performs a database query, so liveness may pass while readiness fails.

## Port already in use

Use the operating system's port/process tools to identify the owning process. Stop only a known development process; do not terminate unrelated processes.

First stop the foreground development server with Ctrl+C. On Windows, if a known development process remains bound to a port, identify its PID:

```powershell
netstat -ano | findstr :<PORT>
```

After confirming that the PID belongs to the intended development process, terminate it:

```powershell
taskkill /PID <PID> /F
```

`netstat` and `taskkill` are Windows-only. Do not use the force option against an unidentified or shared process.

## Web or mobile reports the API as offline

- Confirm backend liveness/readiness.
- Confirm the client API base points to a reachable backend.
- On a physical device, use a network-reachable host rather than loopback.
- Confirm the requesting web origin is allowed by CORS.
- Confirm device/emulator and firewall networking.

## Admin Vite development failure

The admin Vite configuration disables dependency discovery in development because pnpm symlink traversal can leave the readable workspace in sandboxed environments. Use the package's configured development script before attempting custom Vite flags.

## Image upload fails

- Confirm authentication.
- Confirm the target ad exists.
- Confirm the extension and file size meet [API upload rules](../architecture/api.md#image-upload).
- Confirm the storage directory is writable and persisted where required.
- Current validation is extension-based and current routes lack ownership checks; see [Technical debt](../planning/technical-debt.md).

## Empty catalog, favorites, reports, or admin data

Several services currently suppress persistence errors and may return empty or synthetic responses. Check backend/database health before assuming the database is genuinely empty.

## Mobile typecheck command fails

The reviewed Windows environment experienced a failure with the root pnpm mobile TypeScript invocation. This package-local Windows invocation succeeded:

```powershell
.\mobile-app\node_modules\.bin\tsc.CMD -p mobile-app\tsconfig.json --noEmit
```

The checked-in GitHub Actions command was not verified on a clean Linux runner during this review, so CI failure is not confirmed. Verify that invocation on an actual clean Linux GitHub Actions run before changing the workflow, then keep CI and [local verification commands](local-development.md#verification-commands) synchronized.

## Full Docker Compose build fails

The frontend services do not yet have Dockerfiles and nginx is not configured. Use supported local/static-hosting workflows or implement and verify those delivery assets in a separate change.

## Resetting local data

Destroying a database volume is destructive. Only reset explicitly identified local development data, then recreate PostgreSQL, run migrations, and seed if authorized. Never apply a local reset procedure to shared or production data.
