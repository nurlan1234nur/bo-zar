# Technical debt

## High priority: security and authorization

- Existing JWTs remain usable after a user is blocked or suspended.
- Password reset is development-oriented, deterministic by time window, and lacks durable single-use delivery/state.
- Public `/uploads` URLs are not status-aware, so a known image URL remains directly reachable after an advertisement is hidden or deleted.

## High priority: truthful behavior and data integrity

- Broad catches in multiple services hide database failures and may return synthetic/success-shaped data.
- Some admin mutations report success when targets do not exist.
- Admin action attribution relies on a seeded account rather than the authenticated actor.
- Report reviewer tracking is incomplete.
- Image cleanup coordinates normal request failures, but process crashes can still leave orphan files because PostgreSQL and the local filesystem cannot share an atomic transaction.
- The database has no partial unique constraint guaranteeing one main image per advertisement; service locking is the current concurrency boundary.

## Functional gaps

- Ad detail does not increment view count.
- Category counts are not computed.
- Keyword search covers title only and lacks full-text indexing.
- Evaluate `system_event_logs` query patterns and add indexes through a new TypeORM migration if they are required; the table-creation migration does not create indexes.
- Public web now has profile update and all-status My Ads in an in-memory Account view. Password settings, browser routing/deep links, and owner edit/status/delete/image-management actions remain incomplete.
- `UsersService.updateProfile` retains broad error translation, so some persistence failures may still be reported as `404`; narrowing that error handling is a separate backend task.
- Mobile still contains many reusable literal styles.

## Testing and delivery

- Repository tests are primarily mocked backend unit tests.
- Web/admin/mobile test scripts are placeholders; mobile lint is a placeholder.
- Browser, mobile-device, API integration, live-PostgreSQL, and migration tests are absent.
- The root mobile TypeScript invocation failed in the reviewed Windows environment while a package-local command succeeded. CI failure is not confirmed; verify the checked-in command on a clean Linux runner as described in [Troubleshooting](../operations/troubleshooting.md#mobile-typecheck-command-fails).
- Frontend Dockerfiles and nginx configuration are missing despite Compose declarations.
- Backend container installation should be made lockfile/workspace reproducible.
- Local upload storage is not sufficient for stateless deployment without persistence.

## Repository hygiene

- Historical documents must remain isolated under `docs/archive`.
- Generated logs and TypeScript build metadata must remain untracked.
- Component READMEs must stay synchronized with package source.

Address security and truthful error handling before adding major product features.

## Resolved security items

- Public advertisement list/detail and favorites add/list queries enforce `ACTIVE` status and exclude records whose expiration is at or before the request time. Restricted favorite rows remain stored but hidden; non-public owner and moderation workflows remain separate.
- Generic image upload/delete endpoints enforce advertisement ownership without staff override, validate JPEG/PNG/WEBP content before permanent storage, use UUID filenames and path containment, cap each advertisement at eight images, and compensate for normal filesystem/database failures.
