# BO Zar MVP - Run and Test Checklist

> This archived document was sanitized during the 2026-07-14 documentation reorganization. Credential-like examples were replaced with placeholders.

Ene file-iig dagaad app-uudiig asaaj, MVP workflow-uudiig neg burchlen shalgana.

## 0. Prerequisites

- Node.js installed
- Docker Desktop installed and running
- Corepack enabled
- Project root:

```powershell
cd "<REPOSITORY_ROOT>"
```

Dependency suugaagui bol:

```powershell
corepack pnpm install
```

## 1. Quick Build/Test Check

Backend test:

```powershell
corepack pnpm --dir backend test
```

Current automated backend test coverage:

- health controller
- environment validation
- API client request paths, auth headers, FormData upload, error handling
- auth password change and password reset scaffold
- ads search filters, price range, create ad logging
- favorites add/list/remove core behavior
- reports create/idempotency behavior
- admin hide ad, block user, create category behavior
- frontend utility logic used by web/admin/mobile:
  - price formatting
  - image URL resolving
  - API error parsing
  - auth response parsing
  - mobile ad filter/sort
  - admin user/report filters

Expected now:

- 9 test suites pass
- 29 tests pass

Backend build:

```powershell
corepack pnpm --dir backend build
```

Public web build:

```powershell
corepack pnpm --dir web-app build
```

Admin web build:

```powershell
corepack pnpm --dir admin-web build
```

Mobile TypeScript check:

```powershell
.\mobile-app\node_modules\.bin\tsc.CMD -p mobile-app\tsconfig.json --noEmit
```

Expected:

- Backend tests pass
- Backend build succeeds
- Web build succeeds
- Admin build succeeds
- Mobile typecheck succeeds

## 2. Start PostgreSQL

Docker Desktop ajillaj baigaa esehiig shalgaad:

```powershell
docker compose up -d postgres
```

Postgres container status:

```powershell
docker ps
```

Expected:

- `bozar_postgres` container running
- Port `5432` exposed

## 3. Run Migrations

```powershell
corepack pnpm --dir backend migration:run
```

Expected:

- Migration command error-gui duusna
- Tables created in PostgreSQL

## 4. Seed Demo Data

```powershell
corepack pnpm seed:backend
```

Expected:

- `Seed completed`

Demo users:

```text
USER  phone: <EXAMPLE_PHONE>  password: <REPLACE_ME>
ADMIN phone: <EXAMPLE_PHONE>  password: <REPLACE_ME>
```

## 5. Start Backend

Terminal 1:

```powershell
corepack pnpm --dir backend dev
```

Backend URL:

```text
http://localhost:8080/api/v1
```

Health check:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/health
```

Readiness check:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/health/ready
```

Expected:

- `/health` returns `status: ok`
- `/health/ready` returns `database: ready`

## 6. Start Public Web App

Terminal 2:

```powershell
corepack pnpm --dir web-app dev -- --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173/
```

Expected:

- Web app opens
- Data source shows API/live data after backend is running
- Ads/categories load from backend

## 7. Start Admin Web App

Terminal 3:

```powershell
corepack pnpm --dir admin-web dev
```

Open:

```text
http://localhost:3001/
```

If admin dev server fails because of Vite/sandbox dependency optimizer, use:

```powershell
cd admin-web
.\node_modules\.bin\vite.CMD --configLoader native --host 127.0.0.1 --port 3001
```

Expected:

- Admin app opens
- Login panel visible

## 8. Start Mobile App

Terminal 4:

For Android emulator:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="<API_BASE_URL>"
corepack pnpm --dir mobile-app dev
```

For real phone on same Wi-Fi, replace LAN IP:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="<API_BASE_URL>"
corepack pnpm --dir mobile-app dev
```

Example:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="<API_BASE_URL>"
corepack pnpm --dir mobile-app dev
```

Expected:

- Expo Metro opens
- Scan QR with Expo Go, or press `a` for Android emulator
- Mobile app loads categories/ads from backend

## 9. API Smoke Tests

Run these while backend is running.

Health:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/health
```

Categories:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/categories
```

Locations:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/locations
```

Ads:

```powershell
Invoke-RestMethod "http://localhost:8080/api/v1/ads?page=1&size=5"
```

Login demo user:

```powershell
$login = Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/v1/auth/login `
  -ContentType "application/json" `
  -Body '{"identifier":"<EXAMPLE_PHONE>","password":"<REPLACE_ME>"}'

$token = $login.data.token
# Keep the token in memory; do not print or document its value.
```

Get current user:

```powershell
Invoke-RestMethod `
  -Uri http://localhost:8080/api/v1/users/me `
  -Headers @{ Authorization = "Bearer $token" }
```

Expected:

- Login returns JWT token
- `/users/me` returns demo user profile

## 10. Public Web Manual Test

Open:

```text
http://127.0.0.1:5173/
```

Checklist:

- Home page opens
- Category list visible
- Ads list visible
- Search keyword filter works
- Category filter works
- Location filter works
- Price filter works
- Sort works: newest, oldest, most viewed, price asc, price desc
- Click ad card opens detail panel
- Detail panel shows title, price, location, seller, phone
- Login as demo user:
  - phone/email: `<EXAMPLE_PHONE>` or `<EXAMPLE_EMAIL>`
  - password: `<REPLACE_ME>`
- Favorite button works after login
- Create ad opens after login
- Create ad with required fields works
- Optional image upload works
- Report button sends report after login
- Logout clears session

## 11. Admin Web Manual Test

Open:

```text
http://localhost:3001/
```

Login:

```text
phone: <EXAMPLE_PHONE>
password: <REPLACE_ME>
```

Checklist:

- Admin login works
- Dashboard stats load
- User list loads
- User search works
- User filters work: all, active, blocked, suspended
- Block user action works
- Suspend user action works
- Reports list loads
- Resolve report action works
- Hide ad action works
- Admin action logs update
- Category list loads
- Create category works
- Edit category works
- Disable category works
- Select category and load subcategories
- Create subcategory works
- Edit subcategory works
- Disable subcategory works
- Refresh page keeps/validates admin session

## 12. Mobile Manual Test

Open mobile app through Expo.

Checklist:

- Home screen opens
- Source/API status is not offline when backend is reachable
- Categories load
- Ads load
- Pull to refresh works
- Search tab opens
- Search keyword works
- Category filter works
- Location filter works
- Sort works
- Ad detail opens
- Call button opens phone dialer
- Login works with:
  - `<EXAMPLE_PHONE>`
  - `<REPLACE_ME>`
- Register works with new phone number
- Create ad requires login
- Create ad validation works:
  - title minimum length
  - description minimum length
  - phone minimum length
- Create ad works
- Image picker opens
- Image upload works
- Favorite add/remove works
- Favorites tab shows saved ads
- Report from detail works
- Profile shows current user
- My ads list shows user's ads
- Edit my ad works
- Delete my ad marks it deleted
- Logout works

## 13. Password/Auth Extra Tests

Change password API:

```powershell
Invoke-RestMethod `
  -Method Patch `
  -Uri http://localhost:8080/api/v1/auth/change-password `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"currentPassword":"<REPLACE_ME>","newPassword":"<REPLACE_ME>"}'
```

Then login with new password:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/v1/auth/login `
  -ContentType "application/json" `
  -Body '{"identifier":"<EXAMPLE_PHONE>","password":"<REPLACE_ME>"}'
```

Important:

- If you change the demo password, restore the configured development value or reseed the database.

Password reset request in development:

```powershell
$reset = Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/v1/auth/password-reset/request `
  -ContentType "application/json" `
  -Body '{"identifier":"<EXAMPLE_PHONE>"}'

$resetToken = $reset.data.resetToken
# Keep the reset token in memory; do not print or document its value.
```

Confirm reset:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/v1/auth/password-reset/confirm `
  -ContentType "application/json" `
  -Body "{`"identifier`":`"<EXAMPLE_PHONE>`",`"resetToken`":`"$resetToken`",`"newPassword`":`"<REPLACE_ME>`"}"
```

## 14. Image Upload Test

Login and keep `$token`.

Create ad:

```powershell
$ad = Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/v1/ads `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"title":"Test zar","description":"Test description from checklist","price":1000,"categoryId":1,"locationId":1,"contactPhone":"<EXAMPLE_PHONE>"}'

$adId = $ad.data.adId
```

Upload file from local path:

```powershell
$filePath = "C:\path\to\image.jpg"
$form = @{
  files = Get-Item $filePath
}

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:8080/api/v1/ads/$adId/images" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Form $form
```

Expected:

- Response returns `imageId`, `imageUrl`, `thumbnailUrl`
- Image URL opens under `http://localhost:8080/uploads/...`

## 15. Common Problems

### Port already in use

Find process:

```powershell
netstat -ano | findstr :8080
netstat -ano | findstr :5173
netstat -ano | findstr :3001
```

Kill process:

```powershell
taskkill /PID <PID> /F
```

### Backend cannot connect to DB

Check Docker:

```powershell
docker ps
docker compose up -d postgres
```

Then rerun:

```powershell
corepack pnpm --dir backend migration:run
corepack pnpm seed:backend
```

### Web or mobile shows offline

Check:

- Backend running
- Correct API base URL
- CORS is allowing frontend origin
- Mobile real phone uses computer LAN IP, not `localhost`

### Admin dev server fails

Use direct Vite command:

```powershell
cd admin-web
.\node_modules\.bin\vite.CMD --configLoader native --host 127.0.0.1 --port 3001
```

### Reset database

This deletes local DB volume data.

```powershell
docker compose down -v
docker compose up -d postgres
corepack pnpm --dir backend migration:run
corepack pnpm seed:backend
```

## 16. Final MVP Acceptance

MVP OK gej uzeh nuhtsul:

- Backend health and ready OK
- DB migration and seed OK
- User register/login works
- User profile works
- Ads list/detail/create/update/delete works
- Search/filter/sort works
- Image upload works
- Favorites work
- Reports work
- Admin login works
- Admin dashboard loads
- Admin report resolve/hide ad works
- Admin block/suspend user works
- Category/subcategory management works
- Web build OK
- Admin build OK
- Mobile typecheck OK
- Mobile Expo basic workflow OK
