# Folder Structure Document

> This archived document was sanitized during the 2026-07-14 documentation reorganization. Credential-like examples were replaced with placeholders.

# Overview

Энэхүү баримт бичиг нь Баян-Өлгий зар, мэдээллийн платформын project folder structure-ийг тодорхойлно.

Систем дараах үндсэн хэсгүүдтэй байна.

- NestJS Backend API
- React Native + Expo Mobile App
- React Vite Admin Web Panel
- PostgreSQL Database
- Docker / Deployment
- Documentation

---

# Root Project Structure

```text
bo-zar-platform
├── backend
├── mobile-app
├── admin-web
├── docs
├── nginx
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# 1. Backend Folder Structure

Backend нь NestJS + TypeScript ашиглана.

```text
backend
├── src
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto
│   │   ├── guards
│   │   └── strategies
│   ├── users
│   ├── ads
│   ├── categories
│   ├── locations
│   ├── favorites
│   ├── reports
│   ├── admin
│   ├── images
│   ├── common
│   ├── config
│   └── database
├── test
├── package.json
├── tsconfig.json
├── nest-cli.json
├── Dockerfile
└── README.md
```

---

# Backend Module Structure

Module бүр дараах бүтэцтэй байна.

```text
ads
├── ads.controller.ts
├── ads.service.ts
├── ads.module.ts
├── dto
│   ├── create-ad.dto.ts
│   ├── update-ad.dto.ts
│   └── ad-query.dto.ts
├── entities
│   └── advertisement.entity.ts
└── repositories
```

## Backend Modules

```text
auth
users
ads
categories
locations
favorites
reports
admin
images
common
config
database
```

## Module Responsibilities

- `auth`: register, login, logout, JWT, password change/reset
- `users`: profile, role, status
- `ads`: зар үүсгэх, засах, устгах, хайх, status update
- `categories`: category болон subcategory
- `locations`: аймаг, сум, дүүрэг, чиглэл зэрэг байршлын мэдээлэл
- `favorites`: хадгалсан зарууд
- `reports`: зөрчилтэй зар report хийх
- `admin`: moderation, user block/suspend, dashboard stats, admin action log
- `images`: image upload, thumbnail, delete
- `common`: response, exception, decorators, pipes, guards
- `config`: environment config, JWT config, storage config
- `database`: ORM config, migrations, seed data

---

# 2. Mobile App Folder Structure

Mobile app нь React Native + Expo ашиглана. MVP-ийн үндсэн хэрэглэгчийн experience mobile дээр төвлөрнө.

```text
mobile-app
├── src
│   ├── api
│   │   ├── client.ts
│   │   ├── authApi.ts
│   │   ├── adApi.ts
│   │   ├── categoryApi.ts
│   │   ├── locationApi.ts
│   │   ├── favoriteApi.ts
│   │   └── reportApi.ts
│   ├── assets
│   ├── components
│   │   ├── common
│   │   ├── ads
│   │   └── layout
│   ├── screens
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── AdDetailScreen.tsx
│   │   ├── CreateAdScreen.tsx
│   │   ├── EditAdScreen.tsx
│   │   ├── FavoriteScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── navigation
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── BottomTabNavigator.tsx
│   ├── store
│   ├── types
│   ├── utils
│   └── App.tsx
├── app.json
├── package.json
└── README.md
```

---

# 3. Admin Web Folder Structure

Admin panel нь React Vite + TypeScript ашиглана. Public web marketplace нь MVP-д заавал орохгүй, future scope байна.

```text
admin-web
├── public
├── src
│   ├── api
│   ├── components
│   ├── features
│   │   ├── auth
│   │   ├── dashboard
│   │   ├── reports
│   │   ├── users
│   │   ├── ads
│   │   └── categories
│   ├── layouts
│   ├── pages
│   ├── routes
│   ├── store
│   ├── types
│   ├── utils
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── Dockerfile
└── README.md
```

---

# 4. Documentation Folder Structure

```text
docs
├── requirements
│   ├── functional_requirements.md
│   ├── non_functional_requirements.md
│   └── use_cases.md
├── design
│   ├── erd.md
│   ├── database_design.md
│   ├── api_design.md
│   ├── architecture_design.md
│   └── ui_wireframe_planning.md
├── planning
│   └── mvp_sprint_plan.md
└── setup
    ├── backend_setup.md
    ├── mobile_setup.md
    ├── admin_web_setup.md
    └── deployment_guide.md
```

---

# 5. Docker Structure

```text
bo-zar-platform
├── docker-compose.yml
├── backend
│   └── Dockerfile
├── admin-web
│   └── Dockerfile
└── nginx
    └── default.conf
```

Mobile app нь local Expo development workflow ашиглана. Production mobile build нь EAS Build ашиглаж болно.

---

# docker-compose Example

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16
    container_name: bozar_postgres
    environment:
      POSTGRES_DB: <DB_NAME>
      POSTGRES_USER: <DB_USER>
      POSTGRES_PASSWORD: <DB_PASSWORD>
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    container_name: bozar_backend
    ports:
      - "8080:8080"
    depends_on:
      - postgres

  admin-web:
    build: ./admin-web
    container_name: bozar_admin_web
    ports:
      - "3000:80"
    depends_on:
      - backend
```

---

# 6. Environment Files

```text
backend
└── .env

mobile-app
└── .env

admin-web
└── .env
```

## Backend .env Example

```env
DB_HOST=<DB_HOST>
DB_PORT=<DB_PORT>
DB_NAME=<DB_NAME>
DB_USER=<DB_USER>
DB_PASSWORD=<DB_PASSWORD>
JWT_SECRET=<JWT_SECRET>
IMAGE_STORAGE_PATH=<REPLACE_ME>
```

## Mobile .env Example

```env
EXPO_PUBLIC_API_BASE_URL=<API_BASE_URL>
```

## Admin Web .env Example

```env
VITE_API_BASE_URL=<API_BASE_URL>
```

---

# 7. Recommended Development Order

## Step 1
Root project үүсгэнэ.

```text
bo-zar-platform
```

## Step 2
NestJS backend project үүсгэнэ.

## Step 3
PostgreSQL холбож migration/seed бэлдэнэ.

## Step 4
React Native + Expo mobile app үүсгэнэ.

## Step 5
Backend API болон mobile app-ийг холбоно.

## Step 6
React Vite admin web panel үүсгэнэ.

---

# 8. Final Recommended Root Structure

```text
bo-zar-platform
├── backend
├── mobile-app
├── admin-web
├── docs
├── nginx
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# Notes

Эхний хөгжүүлэлт mobile-first байна. Backend API-г эхнээс нь admin web болон future public web app дахин ашиглаж болохоор API-first байдлаар хөгжүүлнэ.
