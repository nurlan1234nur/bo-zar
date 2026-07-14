# Database architecture

Current TypeORM migrations and entities are authoritative. Archived ERDs and SQL examples describe earlier intent and may not match the runtime schema.

## Technology and migration policy

- PostgreSQL 16 is the declared database.
- TypeORM manages persistence.
- Schema synchronization is disabled.
- Schema changes require a new migration and matching entity updates.
- Runtime migration execution is configurable; production deployment must make migration order explicit.

## Current tables

PostgreSQL primary keys are `BIGINT`. TypeORM models IDs as strings internally; API mappers generally expose numbers.

| Table | Important fields | Relationships and constraints |
|---|---|---|
| `roles` | ID, unique role enum | One role to many users; values are user, admin, and moderator roles |
| `locations` | ID, name, optional parent ID, type | One location to many users/ads; parent ID has no database FK |
| `users` | name, unique phone, optional unique email, password hash, profile image, status, timestamps | Required role, optional location, one-to-many ads |
| `categories` | unique name, icon, description, active flag, created timestamp | One-to-many subcategories and ads |
| `subcategories` | category, name, description, active flag | Required category; one-to-many ads |
| `advertisements` | owner, category, optional subcategory/location, title, description, price, status, view count, contact phone, timestamps | Required user/category; optional subcategory/location; one-to-many images |
| `images` | ad, image URL, thumbnail URL, main flag, upload timestamp | Required advertisement |
| `favorites` | user, ad, created timestamp | Unique user/ad pair |
| `reports` | reporter, ad, reason, comment, status, creation/review fields | Unique reporter/ad pair; reviewer ID is not an FK relation |
| `admin_action_logs` | admin user, action, target type/ID, description, timestamp | Required admin-user relation |
| `system_event_logs` | event/actor/target, request fields, message, JSON metadata, timestamp | Operational and security event stream |

## Enum values

- Roles: `USER`, `ADMIN`, `MODERATOR`
- User status: `ACTIVE`, `SUSPENDED`, `BLOCKED`
- Advertisement status: `ACTIVE`, `SOLD`, `INACTIVE`, `EXPIRED`, `HIDDEN`, `DELETED`
- Report status: `PENDING`, `REVIEWED`, `RESOLVED`, `REJECTED`
- Report reason: `SPAM`, `FAKE`, `SCAM`, `DUPLICATE`, `INAPPROPRIATE`, `OTHER`

## Migrations

1. `1720000000000-InitialSchema` creates enum types, marketplace tables, uniqueness rules, and implemented foreign keys.
2. `1720000000001-AddSystemEventLogs` adds the system-event table.

The development seed runs migrations first, then creates catalog, location, user, ad, image, and report fixtures. Seed data and credentials are intentionally excluded from documentation.

## Known schema and persistence debt

- Location hierarchy is a scalar parent ID rather than a self-referencing ORM/database relation.
- Report reviewer is a scalar ID rather than a user relation and is not populated consistently.
- Foreign-key deletion rules use restrictive defaults; cleanup policies are not explicit.
- Image rows and local files do not have a coordinated cleanup lifecycle.
- Category ad counts and ad view increments are not maintained by current services.
- Integration and migration tests against live PostgreSQL are absent.
