
# Architecture Design Document

# Overall Architecture

Систем нь:

- React Native Mobile App
- NestJS Backend API
- PostgreSQL Database
- React Vite Admin Web Panel

ашигласан architecture-тай байна.

---

# Development Strategy

## Phase 1 — Mobile First MVP

Эхлээд:

- Backend API
- PostgreSQL
- React Native Mobile App

хөгжүүлнэ.

---

## Phase 2 — Admin Web Panel

Дараа нь React Vite admin web panel хөгжүүлнэ.

Admin panel нь mobile app-тай ижил backend API ашиглана.

---

# System Architecture

```text
React Native Mobile App
          |
      REST API / JSON
          |
    NestJS Backend
          |
      PostgreSQL
```

Дараа нь:

```text
React Vite Admin Web Panel
            |
        Same API
            |
      NestJS Backend
```

---

# Backend Architecture

## Architecture Style

Modular Monolith Architecture

---

# Backend Folder Structure

```text
backend
 └── src
     ├── main.ts
     ├── app.module.ts
     ├── auth
     ├── users
     ├── ads
     ├── categories
     ├── locations
     ├── favorites
     ├── reports
     ├── admin
     ├── images
     ├── common
     └── config
```

---

# Backend Modules

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
```

---

# Example Module Structure

```text
ad
 ├── ads.controller.ts
 ├── ads.service.ts
 ├── ads.module.ts
 ├── dto
 └── entities
```

---

# Admin Web Architecture

```text
admin-web
 └── src
     ├── api
     ├── assets
     ├── components
     ├── features
     ├── pages
     ├── routes
     ├── store
     └── utils
```

---

# Mobile Architecture

```text
mobile-app
 └── src
     ├── api
     ├── components
     ├── screens
     ├── navigation
     ├── store
     └── utils
```

---

# Recommended Technology Stack

## Frontend
- React Vite
- TypeScript
- TailwindCSS

## Mobile
- React Native
- Expo

## Backend
- NestJS
- TypeScript
- TypeORM эсвэл Prisma

## Database
- PostgreSQL

## Authentication
- JWT

## Deployment
- Docker
- Nginx

---

# Deployment Architecture

```text
[Browser]
    |
[Nginx]
    |
[NestJS API]
    |
[PostgreSQL]
```

---

# Docker Setup

```text
docker-compose.yml
 ├── admin-web
 ├── backend
 └── postgres
```

---

# Future Scalability

Future-д:

- Notification service
- AI search
- Recommendation system
- Cloud image storage
- Microservice architecture

зэрэг өргөтгөлүүдийг хийх боломжтой.

---

# Advantages of Mobile-first Development

- Гол хэрэглэгчдийн mobile хэрэглээг түрүүлж хангана
- Expo ашиглан Android MVP хурдан гаргана
- Backend API эхнээсээ mobile-д тохирсон JSON contract-той болно
- Admin web panel дараа нь ижил API reuse хийнэ
