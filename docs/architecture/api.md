# API architecture

The NestJS API uses the `/api/v1` prefix. Current controllers, DTOs, guards, and services define behavior; archived API examples are historical.

## Conventions

- Public routes require no JWT.
- User routes require a valid bearer JWT.
- Admin routes require an `ADMIN` or `MODERATOR` role.
- Successful application responses generally use `{ success, message, data }`.
- Nest's standard exception responses are currently used for errors; there is no global error-envelope filter.
- Global validation whitelists DTO fields and transforms supported numeric inputs.

## Routes

| Access | Method and path | Purpose |
|---|---|---|
| Public | `GET /health` | Liveness |
| Public | `GET /health/ready` | Database readiness |
| Public | `POST /auth/register` | Register and return an authenticated session |
| Public | `POST /auth/login` | Log in by phone or email |
| Public | `POST /auth/logout` | Acknowledge client-side logout |
| User | `PATCH /auth/change-password` | Change current password |
| Public | `POST /auth/password-reset/request` | Accept a reset request |
| Public | `POST /auth/password-reset/confirm` | Confirm reset and replace password |
| User | `GET /users/me` | Current profile |
| User | `PUT /users/me` | Update current profile |
| User | `GET /users/me/ads` | Current user's ads |
| Public | `GET /ads` | Paginated/filterable ACTIVE, non-expired ad list |
| Public | `GET /ads/:adId` | ACTIVE, non-expired ad detail; other records return 404 |
| User | `POST /ads` | Create ad |
| User | `PUT /ads/:adId` | Update owned ad |
| User | `DELETE /ads/:adId` | Soft-delete owned ad |
| User | `PATCH /ads/:adId/status` | Change owned ad status |
| User | `POST /ads/:adId/images` | Upload images |
| User | `DELETE /images/:imageId` | Delete image metadata |
| Public | `GET /categories` | Active categories |
| Public | `GET /categories/:categoryId/subcategories` | Active subcategories |
| Public | `GET /locations` | Locations |
| Public | `GET /locations/:locationId/children` | Child locations |
| User | `POST /favorites/:adId` | Add an ACTIVE, non-expired advertisement to favorites |
| User | `GET /favorites` | Favorite ads that remain ACTIVE and non-expired |
| User | `DELETE /favorites/:adId` | Remove favorite |
| User | `POST /reports` | Submit report |
| Admin | `GET /admin/reports` | Reports |
| Admin | `GET /admin/users` | Users with ad counts |
| Admin | `PATCH /admin/ads/:adId/hide` | Hide ad |
| Admin | `PATCH /admin/users/:userId/block` | Block user |
| Admin | `PATCH /admin/users/:userId/suspend` | Suspend user |
| Admin | `PATCH /admin/reports/:reportId/resolve` | Resolve report |
| Admin | `GET /admin/dashboard/stats` | Aggregate counts |
| Admin | `GET /admin/logs` | Recent admin actions |
| Admin | `POST /admin/categories` | Create category |
| Admin | `PUT /admin/categories/:categoryId` | Update category |
| Admin | `DELETE /admin/categories/:categoryId` | Soft-disable category |
| Admin | `POST /admin/categories/:categoryId/subcategories` | Create subcategory |
| Admin | `PUT /admin/subcategories/:subcategoryId` | Update subcategory |
| Admin | `DELETE /admin/subcategories/:subcategoryId` | Soft-disable subcategory |

## Ad queries

`GET /ads` accepts `page`, `size`, `keyword`, `categoryId`, `subcategoryId`, `locationId`, `minPrice`, `maxPrice`, and `sort`. Page size is bounded by the service. Sort values are `newest`, `oldest`, `mostViewed`, `priceAsc`, and `priceDesc`. Keyword matching currently searches title only.

Public list and detail access is restricted server-side to advertisements with `ACTIVE` status whose `expiredAt` is either null or later than the request time. A caller-supplied `status` query does not override this rule. Public detail returns 404 for missing, non-`ACTIVE`, or time-expired records without revealing that a restricted record exists. Owner and admin workflows use separate authenticated queries.

Authentication does not override advertisement visibility for favorites. Adding a missing or restricted advertisement returns 404, and the favorites list omits stored favorite rows whose advertisements are no longer `ACTIVE` and non-expired. Reads do not delete those historical favorite rows.

## Key DTO rules

- Registration validates name, phone, optional email, and password.
- Ad creation requires title, description, category, location, and contact phone; price and subcategory are optional.
- Ad updates accept the corresponding fields optionally.
- Ad status must be a defined advertisement status.
- Reports require an ad ID and defined reason; comment is optional.
- Profile updates support name, email, location, and profile-image URL.

Refer to DTO source for exact length and numeric bounds; duplicate validation tables should not be maintained here.

## Image upload

- Multipart field: `files`
- Only the authenticated advertisement owner can upload or delete images; other users, including staff using the generic image endpoints, receive `403`.
- Missing advertisements or images return `404`.
- New uploads are rejected for `HIDDEN` and `DELETED` advertisements. Owners may still delete existing images from those advertisements.
- Maximum images per advertisement: 8; each upload request is also limited to 8 files.
- Maximum size per file: 5 MB
- Accepted content: JPEG, PNG, and WEBP. Declared MIME type, filename extension, and detected magic bytes must agree; common JPEG aliases are normalized.
- Storage: local filesystem using server-generated UUID filenames. Original filenames never become storage paths.
- Validation and authorization complete before permanent files are written. Database writes use a transaction, and request-created files are removed when filesystem or database work fails.
- Image deletion stages the physical file, deletes metadata transactionally, restores the file on database rollback, and selects the oldest remaining image (then lowest ID) as the replacement main image.
- Returned thumbnail URL currently points to the same stored file; thumbnail generation is not implemented

## Known contract limitations

- Uploaded files remain directly reachable through public `/uploads` URLs if the URL is known, even after an advertisement becomes hidden or deleted; status-aware asset delivery is not implemented.
- The database does not enforce a partial unique constraint for one main image per advertisement. Service transactions reduce conflicts, but cross-process/concurrent integrity remains a known limitation.
- Some services suppress persistence errors and return success-shaped or synthetic data.
- Logout has no server-side revocation.
- Password reset is development-oriented and lacks durable single-use delivery/state.
- Shared types use numeric API IDs while TypeORM represents bigint IDs as strings internally.

Contract changes must update backend DTO/controller/service behavior, shared types, the API client, consumers, tests, and this document together.
