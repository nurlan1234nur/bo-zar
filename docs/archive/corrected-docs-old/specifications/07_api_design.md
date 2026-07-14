
# API Design Document

> This archived document was sanitized during the 2026-07-14 documentation reorganization. Credential-like examples were replaced with placeholders.

# API Architecture

Backend нь REST API architecture ашиглана.

Frontend:
- React Native Mobile
- React Vite Admin Web Panel

хоёулаа ижил backend API ашиглана.

---

# Base URL

```text
/api/v1
```

---

# Authentication APIs

## Register

```http
POST /api/v1/auth/register
```

### Request Body

```json
{
  "fullName": "<EXAMPLE_NAME>",
  "phone": "<EXAMPLE_PHONE>",
  "email": "<EXAMPLE_EMAIL>",
  "password": "<REPLACE_ME>"
}
```

---

## Login

```http
POST /api/v1/auth/login
```

### Response

```json
{
  "token": "jwt_token",
  "user": {
    "userId": 1,
    "fullName": "Eska Esen",
    "role": "USER"
  }
}
```

---

## Logout

```http
POST /api/v1/auth/logout
```

---

## Change Password

```http
PATCH /api/v1/auth/change-password
```

### Request Body

```json
{
  "currentPassword": "<REPLACE_ME>",
  "newPassword": "<REPLACE_ME>"
}
```

---

## Request Password Reset

```http
POST /api/v1/auth/password-reset/request
```

---

## Confirm Password Reset

```http
POST /api/v1/auth/password-reset/confirm
```

---

# User APIs

## Get Current User

```http
GET /api/v1/users/me
```

---

## Update Profile

```http
PUT /api/v1/users/me
```

---

## Get My Ads

```http
GET /api/v1/users/me/ads
```

---

# Advertisement APIs

## Get Ads

```http
GET /api/v1/ads
```

### Query Parameters

```text
?page=1
&size=20
&categoryId=1
&subcategoryId=2
&locationId=2
&minPrice=100000
&maxPrice=900000
&keyword=байр
&sort=newest
&status=ACTIVE
```

### Sort Values

```text
newest
oldest
mostViewed
priceAsc
priceDesc
```

Default search нь зөвхөн `ACTIVE` зар буцаана.

---

## Get Ad Detail

```http
GET /api/v1/ads/{adId}
```

---

## Create Ad

```http
POST /api/v1/ads
```

### Request Body

```json
{
  "title": "1 өрөө байр түрээслүүлнэ",
  "description": "Оюутанд тохиромжтой",
  "price": 800000,
  "categoryId": 1,
  "subcategoryId": 2,
  "locationId": 5
}
```

---

## Update Ad

```http
PUT /api/v1/ads/{adId}
```

---

## Delete Ad

```http
DELETE /api/v1/ads/{adId}
```

---

## Update Ad Status

```http
PATCH /api/v1/ads/{adId}/status
```

### Request Body

```json
{
  "status": "SOLD"
}
```

---

# Image APIs

## Upload Images

```http
POST /api/v1/ads/{adId}/images
```

### Request

```text
Content-Type: multipart/form-data
files: image files
```

Allowed file types: `jpg`, `jpeg`, `png`, `webp`.
MVP max file size: 5MB per image.
Backend нь thumbnail үүсгэнэ.

---

## Delete Image

```http
DELETE /api/v1/images/{imageId}
```

---

# Category APIs

## Get Categories

```http
GET /api/v1/categories
```

---

## Get Subcategories

```http
GET /api/v1/categories/{categoryId}/subcategories
```

---

# Location APIs

## Get Locations

```http
GET /api/v1/locations
```

---

## Get Child Locations

```http
GET /api/v1/locations/{locationId}/children
```

---

# Favorite APIs

## Add Favorite

```http
POST /api/v1/favorites/{adId}
```

---

## Get Favorites

```http
GET /api/v1/favorites
```

---

## Remove Favorite

```http
DELETE /api/v1/favorites/{adId}
```

---

# Report APIs

## Create Report

```http
POST /api/v1/reports
```

### Request Body

```json
{
  "adId": 1,
  "reason": "SPAM",
  "comment": "Давхардсан зар байна"
}
```

Reason values: `SPAM`, `FAKE`, `SCAM`, `DUPLICATE`, `INAPPROPRIATE`, `OTHER`.

---

# Admin APIs

## Get Reports

```http
GET /api/v1/admin/reports
```

---

## Hide Advertisement

```http
PATCH /api/v1/admin/ads/{adId}/hide
```

---

## Block User

```http
PATCH /api/v1/admin/users/{userId}/block
```

---

## Suspend User

```http
PATCH /api/v1/admin/users/{userId}/suspend
```

---

## Get Dashboard Statistics

```http
GET /api/v1/admin/dashboard/stats
```

---

## Resolve Report

```http
PATCH /api/v1/admin/reports/{reportId}/resolve
```

---

## Admin Category CRUD

```http
POST /api/v1/admin/categories
PUT /api/v1/admin/categories/{categoryId}
DELETE /api/v1/admin/categories/{categoryId}
POST /api/v1/admin/categories/{categoryId}/subcategories
PUT /api/v1/admin/subcategories/{subcategoryId}
DELETE /api/v1/admin/subcategories/{subcategoryId}
```

---

# API Response Structure

## Success Response

```json
{
  "success": true,
  "message": "Амжилттай",
  "data": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Алдаа гарлаа"
}
```

---

# Authentication

- JWT Authentication
- Role-based authorization
- Protected endpoints
- Token validation
- Guest нь token-гүй public request байна
- USER, ADMIN, MODERATOR нь database role байна

---

# Future APIs

- Chat APIs
- Notification APIs
- Review APIs
- Payment APIs
