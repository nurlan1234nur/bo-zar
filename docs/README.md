# BO Zar documentation

This directory is the navigation index for BO Zar documentation.

## Authority order

When documents disagree, use this order:

1. Current application source and TypeORM migrations define shipped behavior and the database schema.
2. [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) summarizes the latest reviewed repository state.
3. Canonical documents below describe current requirements, architecture, operations, and plans.
4. Component READMEs describe component-local responsibilities and commands.
5. [`archive/`](archive/) is historical/reference-only and never overrides implementation.

The archived Figma export is a design prototype, not production functionality.

## Canonical documents

### Product

- [Requirements](product/requirements.md)
- [User roles and permissions](product/user-roles.md)
- [Feature status](product/feature-status.md)

### Architecture

- [System overview](architecture/system-overview.md)
- [Database](architecture/database.md)
- [API](architecture/api.md)

### Design

- [Design system](design/design-system.md)
- [User flows](design/user-flows.md)
- [Prototypes](design/prototypes.md)

### Operations

- [Local development](operations/local-development.md)
- [Deployment](operations/deployment.md)
- [Troubleshooting](operations/troubleshooting.md)

### Planning

- [Roadmap](planning/roadmap.md)
- [Technical debt](planning/technical-debt.md)

## Component documentation

- [Backend](../backend/README.md)
- [Public web](../web-app/README.md)
- [Admin web](../admin-web/README.md)
- [Mobile](../mobile-app/README.md)
- [API client](../packages/api-client/README.md)
- [Shared types](../packages/shared-types/README.md)
- [Design tokens](../packages/design-tokens/README.md)
- [Nginx placeholder](../nginx/README.md)

## Archive

- [`archive/corrected-docs-old/`](archive/corrected-docs-old/) preserves the corrected MVP specifications and the former root acceptance checklist.
- [`archive/pdf-old/`](archive/pdf-old/) preserves original PDF deliverables and the unique legacy database design.
- [`archive/early-prototypes/`](archive/early-prototypes/) preserves the standalone Figma-exported prototype with its attribution.

Archived material may contain obsolete examples or planned structures. Do not copy it into current documentation without checking implementation and migrations first.
