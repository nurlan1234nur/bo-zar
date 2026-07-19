# User roles and permissions

## Role model

`GUEST` is an unauthenticated state, not a database role. Database roles are `USER`, `ADMIN`, and `MODERATOR`.

| Capability | Who initiates it | Account or role effect | Guest | Existing USER | Existing MODERATOR | Existing ADMIN |
|---|---|---|---:|---:|---:|---:|
| Browse categories, locations, and ads | Any client | None | Yes | Yes | Yes | Yes |
| View ad details/contact phone | Any client | None | Yes | Yes | Yes | Yes |
| Register a new USER account | An unauthenticated client | Always creates `USER`; the caller cannot choose `ADMIN` or `MODERATOR` | Yes | No | No | No |
| Log in | An unauthenticated client with valid credentials | Authenticates an existing `USER`, `MODERATOR`, or `ADMIN` account whose status is allowed | Yes | Yes | Yes | Yes |
| Update own profile/password | The authenticated account | No role change | No | Yes | Yes | Yes |
| Create/manage own ads | The authenticated account | No role change | No | Yes | Yes | Yes |
| Favorite/report ads | The authenticated account | No role change | No | Yes | Yes | Yes |
| View admin users/reports/stats/logs | Authenticated staff | No role change | No | No | Yes | Yes |
| Hide ads and resolve reports | Authenticated staff | No role change | No | No | Yes | Yes |
| Block/suspend users | Authenticated staff | Changes the target user's status, not role | No | No | Yes | Yes |
| Manage categories/subcategories | Authenticated staff | No role change | No | No | Yes | Yes |

## Authentication boundaries

- Public routes accept requests without a bearer token.
- Public registration always creates a `USER`; it does not expose public staff-role selection.
- Protected user routes require a valid, unexpired JWT.
- Admin routes require a JWT plus an `ADMIN` or `MODERATOR` role claim.
- Ownership checks protect normal ad update, status, and delete operations.

## Current limitations

- Logout does not revoke a server-side session.
- Existing JWTs are not revalidated against a later user-status change.
- Generic image upload and deletion require advertisement ownership. Non-owners, including administrators and moderators, receive `403`; staff image removal requires a future attributed moderation endpoint.

Public-web users can view and update allowlisted fields on their own profile and list all of their advertisements, including hidden/deleted records. Phone, role, and status are read-only; advertisement management actions are not part of this workflow yet.
- Staff action logs currently do not reliably identify the authenticated staff member.

These limitations are tracked in [Technical debt](../planning/technical-debt.md).
