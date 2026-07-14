# Product requirements

## Purpose

BO Zar is a centralized classifieds marketplace for Bayan-Ulgii residents, including people living in Bayan-Ulgii province and Ulaanbaatar. It provides public ad discovery, authenticated posting and account workflows, and staff moderation.

## Target users

- Guests browsing and contacting sellers
- Registered users publishing and managing ads
- Administrators and moderators handling reports, users, ads, and catalog data

## Current functional requirements

### Authentication and profile

- Register using a name, phone number, optional email, and password.
- Log in by phone number or email and receive a JWT.
- View and update the current profile.
- Change a password while authenticated.
- Support the current development-oriented password-reset API.
- Log out by discarding the client-side token.

### Marketplace

- Browse paginated active ads without authentication.
- View ad details and seller contact information.
- Search titles and filter public discovery by keyword, category, subcategory, location, and price.
- Public list and detail expose only `ACTIVE`, non-expired advertisements.
- Advertisement status management belongs to authenticated owner and admin workflows, not public discovery filtering.
- Sort by newest, oldest, most viewed, and price.
- Authenticated owners can create, edit, change status, and soft-delete ads.
- Authenticated users can upload supported image formats within the API limits.
- Authenticated users can save currently public-visible advertisements, remove favorites, and submit one report per ad. Favorite rows whose advertisements later become restricted remain stored but are hidden from responses.

### Moderation and catalog

- Administrators and moderators can view users and reports.
- Staff can block or suspend users, hide ads, and resolve reports.
- Staff can create, edit, and soft-disable categories and subcategories.
- Staff can view dashboard totals and recent admin actions.

## Current non-functional requirements

- PostgreSQL persistence with schema changes applied through migrations.
- JWT and role-based guards on protected endpoints.
- DTO validation and whitelisting for API inputs.
- Liveness and database-readiness checks.
- Request IDs and persisted operational/security events.
- Shared TypeScript contracts and a shared API client across applications.
- Shared semantic design tokens across public web, admin web, and mobile.
- No credentials, reset tokens, environment values, or uploaded user data in source control or documentation.

Performance, availability, accessibility, and concurrent-user targets in archived specifications remain goals until measured and verified.

## Product boundaries

The current contact workflow exposes a seller phone number; it does not include real-time chat. Payments, promoted ads, push notifications, ratings, seller verification, recommendations, AI search, and advanced analytics are not shipped.

See [Feature status](feature-status.md) for client-specific implementation coverage and [Roadmap](../planning/roadmap.md) for planned work.
