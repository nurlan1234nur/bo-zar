# Roadmap

This roadmap separates near-term completion work from post-MVP product ideas. It does not authorize implementation by itself.

## Near-term hardening

1. Fix image ownership checks, content validation, and file cleanup.
2. Restrict public visibility of non-active ads.
3. Revalidate user status for authenticated requests or introduce a session/revocation design.
4. Replace swallowed persistence failures with truthful errors.
5. Correct admin audit attribution and report reviewer tracking.
6. Fix mobile CI typechecking and complete a reproducible deployment path.
7. Add live-database integration and client end-to-end tests.
8. Add durable object storage or a supported persistent-volume strategy.
9. Bring public web owner/profile workflows closer to mobile parity.
10. Continue extracting reusable UI primitives and applying shared tokens on mobile.

## Product roadmap

Planned, not shipped:

- Real-time chat
- Push notifications
- Promoted/boosted ads
- Payments
- Seller verification
- Ratings and reviews
- Better full-text search, followed by semantic/AI search if justified
- Recommendation features
- Advanced analytics
- SEO-friendly public listing/detail routing
- Further iOS optimization

## Already delivered from older plans

The public React/Vite marketplace, shared API client, shared types, design tokens, admin catalog management, system-event logs, and password workflows exist at MVP/partial level. Archived plans that call them wholly future are historical.

Major architectural rewrites and microservice extraction are not documentation-cleanup goals. Revisit service boundaries only when measured operational needs justify them.
