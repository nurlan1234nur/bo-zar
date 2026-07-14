# Local development

## Prerequisites

- Node.js compatible with the repository/CI configuration
- Corepack and pnpm
- Docker Desktop or another reachable PostgreSQL installation
- Installed workspace dependencies

Do not copy real environment values into documentation. Use the tracked, sanitized `.env.example` files as variable-name references and keep real environment files untracked.

## Workspace commands

From the repository root:

```powershell
corepack pnpm dev:backend
corepack pnpm dev:web
corepack pnpm dev:admin
corepack pnpm dev:mobile
```

Equivalent package-scoped commands:

```powershell
corepack pnpm --dir backend dev
corepack pnpm --dir web-app dev
corepack pnpm --dir admin-web dev
corepack pnpm --dir mobile-app dev
```

Stop a foreground development server normally with Ctrl+C in its terminal.

## Mobile devices and simulators

Start Expo Metro with `corepack pnpm dev:mobile` or `corepack pnpm --dir mobile-app dev`.

- **Expo Go on a physical Android or iOS device:** install Expo Go, put the device and development computer on a network where they can reach each other, then scan the QR code shown by Expo. Configure `EXPO_PUBLIC_API_BASE_URL` with a backend address reachable from the device; device loopback points to the device itself, not the development computer.
- **Android emulator:** start and unlock an emulator first, then run `corepack pnpm --dir mobile-app android` or press `a` in the Metro terminal. Configure the API base with an address through which that emulator can reach the host backend. This path requires a locally configured Android SDK/emulator.
- **iOS Simulator (macOS only):** run `corepack pnpm --dir mobile-app ios` or press `i` in Metro. The iOS Simulator requires macOS and Xcode and cannot run on Windows. A physical iOS device may still use Expo Go when the network and supported Expo SDK are compatible.
- **Browser preview:** Expo offers the `w` shortcut from Metro, but this repository does not currently declare the usual Expo web runtime dependencies. Browser preview was not verified during the documentation review and may require a separately approved dependency/configuration change. Use `web-app` for the supported public browser client.

The `android` and `ios` commands above are current `mobile-app/package.json` scripts. Device, simulator, and browser behavior was not executed as part of this documentation-only change.

## Database workflow

Start the declared PostgreSQL service, then apply migrations before seeding or starting dependent workflows:

```powershell
docker compose up -d postgres
corepack pnpm --dir backend migration:run
corepack pnpm seed:backend
```

Revert only the most recent migration when an intentional rollback is required:

```powershell
corepack pnpm --dir backend migration:revert
```

Seed data is for development. Never document its credentials or run production seeding without explicit authorization.

## Verification commands

```powershell
corepack pnpm --dir backend test -- --runInBand
corepack pnpm --dir backend build
corepack pnpm --dir web-app build
corepack pnpm --dir admin-web build
.\mobile-app\node_modules\.bin\tsc.CMD -p mobile-app\tsconfig.json --noEmit
```

The package-local Windows mobile command is verified in this workspace. The GitHub Actions command has not been verified on a clean Linux runner; see [Mobile typecheck command fails](troubleshooting.md#mobile-typecheck-command-fails).

## Health checks

After starting the backend, verify both the liveness and database-readiness routes documented in [API architecture](../architecture/api.md).

## Manual acceptance areas

- Guest category/location/ad browsing and filtering
- Registration, login, restored session, and logout
- Favorite and report workflows
- Create ad and image upload
- Mobile owner edit/soft-delete workflow
- Admin stats, users, reports, moderation, logs, and catalog management

Do not place test credentials in canonical documentation. Keep environment-specific acceptance data outside version control.
