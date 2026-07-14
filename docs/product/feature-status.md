# Feature status

Status meanings:

- **Implemented**: present in current source and connected to the API.
- **Partial**: present with a known workflow, security, UI, or delivery limitation.
- **Planned**: documented intent without production implementation.
- **Reference only**: appears only in archived specifications or prototypes.

| Feature | Backend | Public web | Admin web | Mobile | Overall |
|---|---|---|---|---|---|
| Register/login/logout | Implemented | Implemented | Login/logout | Implemented | Implemented |
| Profile view/update | Implemented | Session validation only | Session validation only | Profile view | Partial |
| Password change/reset | API implemented | No UI | No UI | No UI | Partial |
| Browse/detail ads | Implemented | Implemented | Moderation context | Implemented | Implemented |
| Search/filter/sort | Implemented | Implemented | User/report filters | Implemented | Implemented; title-only keyword search |
| Create ads | Implemented | Implemented | Not applicable | Implemented | Implemented |
| Edit/delete own ads | Implemented | No owner UI | Not applicable | Implemented | Partial client parity |
| Image upload | Partial | Implemented | Not applicable | Implemented | Partial security/storage behavior |
| Favorites | Implemented | Implemented | Not applicable | Implemented | Implemented |
| Reports | Implemented | Implemented | Review/resolve | Implemented | Partial error/audit behavior |
| User moderation | Implemented | Not applicable | Implemented | Not applicable | Implemented with token-status limitation |
| Category management | Implemented | Read-only | Implemented | Read-only | Implemented |
| Dashboard/action logs | Implemented | Not applicable | Implemented | Not applicable | Partial audit attribution |
| Light/dark theme | Not applicable | Implemented | Implemented | Shared light theme | Partial |
| Real-time chat | Not implemented | Not implemented | Not applicable | Not implemented | Planned |
| Push notifications | Not implemented | Not implemented | Not implemented | Not implemented | Planned |
| Payments/promoted ads | Not implemented | Not implemented | Not implemented | Not implemented | Planned |
| Ratings/verified sellers | Not implemented | Not implemented | Not implemented | Not implemented | Planned |
| AI search/recommendations | Not implemented | Not implemented | Not implemented | Not implemented | Planned |

## Verification baseline

At the latest documentation review, backend unit tests, backend build, public web build, admin web build, and the package-local mobile TypeScript check passed. Live PostgreSQL integration, browser end-to-end behavior, container deployment, and physical-device workflows require separate environment verification.
