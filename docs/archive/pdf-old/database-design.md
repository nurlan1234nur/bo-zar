
# Database Design Document

## Overview

Энэхүү баримт бичиг нь Баян-Өлгий иргэдэд зориулсан зар, мэдээллийн платформын database design-ийг тодорхойлно.

Систем нь:
- React Native mobile application
- React Vite admin web panel

хоёрыг нэг backend API ашиглан дэмжинэ.

---

# Database Technology

## Selected Database
PostgreSQL

## Яагаад PostgreSQL сонгосон бэ?

- Relationship ихтэй системд тохиромжтой
- Search/filter ажиллагаа сайн
- Future scalability сайн
- ACID transaction support
- REST API backend-тэй сайн ажилладаг

---

# Main Tables

## 1. roles

```sql
CREATE TABLE roles (
    role_id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);
```

### Role values
- USER
- ADMIN
- MODERATOR

Guest нь database role биш, нэвтрээгүй хэрэглэгчийн төлөв байна.

---

## 2. locations

```sql
CREATE TABLE locations (
    location_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_location_id BIGINT,
    type VARCHAR(50)
);
```

### Example locations
- Улаанбаатар
- Баян-Өлгий
- Өлгий сум
- Баянзүрх

---

## 3. users

```sql
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(500),
    role_id BIGINT NOT NULL,
    location_id BIGINT,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User fields
- full_name
- phone
- email
- password_hash
- profile_image
- role_id
- location_id

### User Status
- ACTIVE
- SUSPENDED
- BLOCKED

---

## 4. categories

```sql
CREATE TABLE categories (
    category_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Example categories
- Түрээс
- Автомашин
- Гар утас
- Дайвар
- Ажил

---

## 5. subcategories

```sql
CREATE TABLE subcategories (
    subcategory_id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);
```

---

## 6. advertisements

```sql
CREATE TABLE advertisements (
    ad_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    subcategory_id BIGINT,
    location_id BIGINT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12,2),
    status VARCHAR(30) DEFAULT 'ACTIVE',
    view_count INT DEFAULT 0,
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expired_at TIMESTAMP
);
```

### Advertisement Status
- ACTIVE
- SOLD
- INACTIVE
- EXPIRED
- HIDDEN
- DELETED

---

## 7. images

```sql
CREATE TABLE images (
    image_id BIGSERIAL PRIMARY KEY,
    ad_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    is_main BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. favorites

```sql
CREATE TABLE favorites (
    favorite_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ad_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_favorites_user_ad UNIQUE (user_id, ad_id)
);
```

---

## 9. reports

```sql
CREATE TABLE reports (
    report_id BIGSERIAL PRIMARY KEY,
    reporter_user_id BIGINT NOT NULL,
    ad_id BIGINT NOT NULL,
    reason VARCHAR(50) NOT NULL,
    comment TEXT,
    status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by BIGINT,
    CONSTRAINT uq_reports_user_ad UNIQUE (reporter_user_id, ad_id)
);
```

### Report Reasons
- SPAM
- FAKE
- SCAM
- DUPLICATE
- INAPPROPRIATE
- OTHER

### Report Status
- PENDING
- REVIEWED
- RESOLVED
- REJECTED

---

## 10. admin_action_logs

```sql
CREATE TABLE admin_action_logs (
    log_id BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id BIGINT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Action Types
- DELETE_AD
- HIDE_AD
- BLOCK_USER
- SUSPEND_USER
- REVIEW_REPORT
- CREATE_CATEGORY
- UPDATE_CATEGORY

---

# Relationships

```text
Role 1 ─── * User

User 1 ─── * Advertisement

Category 1 ─── * SubCategory

Category 1 ─── * Advertisement

Advertisement 1 ─── * Image

User(Admin) 1 ─── * AdminActionLog

User * ─── * Advertisement
      through Favorite
```

---

# Indexes

```sql
CREATE INDEX idx_ads_category ON advertisements(category_id);
CREATE INDEX idx_ads_location ON advertisements(location_id);
CREATE INDEX idx_ads_status ON advertisements(status);
CREATE INDEX idx_ads_created_at ON advertisements(created_at);
CREATE INDEX idx_ads_price ON advertisements(price);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_admin_logs_admin ON admin_action_logs(admin_user_id);
```

---

# Future Improvements

- Chat tables
- Notification tables
- Review/Rating system
- Payment system
- AI recommendation
