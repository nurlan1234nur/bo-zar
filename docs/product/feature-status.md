# Feature status

Status meanings:

- **Implemented**: present in current source and connected to the API.
- **Partial**: present with a known workflow, security, UI, or delivery limitation.
- **Planned**: documented intent without production implementation.
- **Reference only**: appears only in archived specifications or prototypes.

| Feature | Backend | Public web | Admin web | Mobile | Overall |
|---|---|---|---|---|---|
| Register/login/logout | Implemented | Implemented | Login/logout | Implemented | Implemented |
| Profile view/update | Implemented | Implemented in Account view | Session validation only | Profile view | Partial client parity |
| Password change/reset | API implemented | Authenticated password-change UI; reset has no UI | No UI | No UI | Partial |
| Browse/detail ads | Implemented; public results are ACTIVE and non-expired | Implemented with the responsive shared-token marketplace design | Moderation context | Implemented | Implemented |
| Search/filter/sort | Implemented with title/description keyword matching | Implemented with URL-synchronized keyword, category/subcategory, location, price, sort, pagination state, and compact mobile filter disclosure | User/report filters | Implemented | Implemented |
| Create ads | Implemented | Implemented | Not applicable | Implemented | Implemented |
| View own ads in all statuses | Implemented | Implemented | Not applicable | Implemented | Implemented |
| Edit/delete own ads | Implemented | Implemented in Account view, including status changes and soft-delete | Not applicable | Implemented | Implemented |
| Image upload | Owner authorization, content validation, limits, and coordinated local cleanup implemented | Implemented | Not applicable | Implemented | Implemented locally; direct static URL and durable-storage gaps remain |
| Favorites | Implemented; add/list enforce public visibility | Implemented with a dedicated saved-advertisements view | Not applicable | Implemented | Implemented |
| Reports | Implemented | Implemented | Review/resolve | Implemented | Partial error/audit behavior |
| User moderation | Implemented with request-time user-status validation | Not applicable | Implemented | Not applicable | Implemented |
| Category management | Implemented | Read-only | Implemented | Read-only | Implemented |
| Dashboard/action logs | Implemented | Not applicable | Implemented | Not applicable | Partial audit attribution |
| Light/dark theme | Not applicable | Implemented | Implemented | Shared light theme | Partial |
| Real-time chat | Not implemented | Not implemented | Not applicable | Not implemented | Planned |
| Push notifications | Not implemented | Not implemented | Not implemented | Not implemented | Planned |
| Payments/promoted ads | Not implemented | Not implemented | Not implemented | Not implemented | Planned |
| Ratings/verified sellers | Not implemented | Not implemented | Not implemented | Not implemented | Planned |
| AI search/recommendations | Not implemented | Not implemented | Not implemented | Not implemented | Planned |

## Verification baseline

Public advertisement list/detail and non-owner favorites visibility are enforced by the backend: only `ACTIVE` records with no expiration or a future `expiredAt` are exposed. Restricted favorite rows remain stored but are omitted from responses. Owner and moderation queries remain separate and may include non-public statuses.

At the latest documentation review, backend unit tests, backend build, public web build, admin web build, and the package-local mobile TypeScript check passed. Live PostgreSQL integration, browser end-to-end behavior, container deployment, and physical-device workflows require separate environment verification.

Image upload/delete uses owner-only generic endpoints. Non-owners, including staff, do not receive an override; any future staff image-removal workflow requires a separate attributed moderation endpoint. Upload validation checks JPEG/PNG/WEBP content, MIME, and extension before UUID-named local files are persisted. Local filesystem and database failures use compensating cleanup, but public static URLs are not status-aware and the database has no single-main-image constraint.

The public web Account view restores stored sessions through `GET /users/me`, refreshes local profile state from the server, supports allowlisted profile updates and authenticated password changes, and lists the owner's advertisements across every status. Owners can edit advertisements, switch between active, sold, and inactive states, and soft-delete with confirmation. The browse, account, and favorites views use deep-linkable browser paths with protected-route handling. Password reset remains separate work.

Public-web advertisement creation preflights the declared image type, 5-MB-per-file limit, and 8-file limit before creating the advertisement. The backend remains authoritative. A later server-side upload failure does not undo the created advertisement or retain a local blob preview, and the UI reports that partial outcome. The authenticated Favorites view lists the server-backed saved advertisements and supports opening or removing them.
