# Repository guidance
cc
## Source of truth

- Current application source and TypeORM migrations define shipped behavior and database structure.
- `PROJECT_CONTEXT.md` summarizes the latest reviewed repository state.
- `docs/README.md` is the documentation index.
- `docs/archive` is historical/reference-only and never overrides implementation.
- The archived Figma export is not production functionality.

## Layout

- `backend`: NestJS, TypeORM, PostgreSQL API
- `web-app`: React/Vite public marketplace
- `admin-web`: React/Vite administration panel
- `mobile-app`: Expo/React Native client
- `packages/shared-types`: shared TypeScript contracts
- `packages/api-client`: shared REST client
- `packages/design-tokens`: shared visual tokens

Do not move runtime projects into an `apps` directory without explicit approval.

## Build, test, and typecheck

Run checks relevant to changed areas:

- Backend tests: `corepack pnpm --dir backend test -- --runInBand`
- Backend build: `corepack pnpm --dir backend build`
- Public web build: `corepack pnpm --dir web-app build`
- Admin web build: `corepack pnpm --dir admin-web build`
- Mobile typecheck on Windows: `.\mobile-app\node_modules\.bin\tsc.CMD -p mobile-app\tsconfig.json --noEmit`

The package-local Windows command above is locally verified. The checked-in GitHub Actions invocation was not verified on a clean Linux runner during the latest review; see [mobile typecheck troubleshooting](docs/operations/troubleshooting.md#mobile-typecheck-command-fails).

## Database

- Make schema changes through TypeORM migrations.
- Do not enable `synchronize`.
- Update entities, migrations, seed behavior, database docs, and tests together.
- Do not run production seeds without explicit authorization.

## Shared contracts

When an API contract changes, update backend DTO/controller/service behavior, `packages/shared-types`, `packages/api-client`, affected clients, tests, and API documentation.

## Design

- Use `packages/design-tokens` for shared semantic colors, spacing, radius, typography, and layout.
- Keep prototype assets separate from production behavior.
- Prefer reusable app-local components over repeated styling.

## Security

- Never print, copy, commit, or document credentials, environment values, reset tokens, private user data, or uploaded content.
- Keep real environment files, runtime logs, generated output, and uploads untracked.
- Use placeholders only in examples.
- Do not weaken authentication, authorization, upload validation, or role checks.

## Documentation

- Update canonical docs when shipped behavior changes.
- Label features as implemented, partial, planned, or historical.
- Do not alter archived documents except for archival/status metadata.
- Keep `PROJECT_CONTEXT.md` concise and check internal links after moves.

## Definition of done

- Requested work is implemented within scope.
- Relevant tests, builds, and typechecks pass.
- Schema changes include migrations.
- Shared contracts and consumers remain synchronized.
- Documentation reflects shipped behavior.
- No generated output, logs, secrets, uploads, or unrelated changes are included.
- `git diff --check` passes.
