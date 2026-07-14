# User flows

## Guest discovery

1. Open public web or mobile.
2. Load categories, locations, and active ads.
3. Search, filter, and sort listings.
4. Open ad detail.
5. View contact information or start a phone call on mobile.
6. Authenticate when attempting a protected action.

## Registration and login

1. Submit registration or login information.
2. Backend validates credentials and active status.
3. Client stores the returned session locally.
4. Client validates restored sessions through the current-user endpoint.
5. Logout removes the local session; it does not revoke the JWT server-side.

## Publish and manage an ad

1. Authenticate.
2. Enter required ad fields and optional price/subcategory.
3. Create the ad.
4. Optionally upload images after creation.
5. On mobile, open a current-user ad to edit or soft-delete it.
6. Public web currently creates ads but does not provide the full owner-management UI.

## Favorites and reports

- Authenticated users toggle favorites from cards/detail and load saved ads.
- Authenticated users submit a report from ad detail.
- The backend treats repeated reports for the same user/ad pair idempotently.
- Staff review reports in the admin panel, may hide the ad, and resolve the report.

## Administration

1. Staff authenticate with an admin/moderator role.
2. Dashboard loads totals, users, reports, action logs, and catalog data.
3. Staff filter users/reports and perform moderation actions.
4. Staff create, edit, or soft-disable categories/subcategories.

## Planned flows

Chat, notification, payment, promotion, rating, seller-verification, and recommendation flows are planned only. Mock versions in archived prototypes are not shipped behavior.
