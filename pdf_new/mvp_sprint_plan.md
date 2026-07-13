
# MVP Scope and Sprint Plan

# Project Overview

Энэхүү систем нь Баян-Өлгий аймгийн иргэд болон Улаанбаатар хотод сурч, ажиллаж, амьдарч буй Баян-Өлгийн иргэдэд зориулсан зар, мэдээллийн төвлөрсөн платформ юм.

Систем:
- React Native Mobile
- NestJS Backend
- PostgreSQL Database
- React Vite Admin Web Panel

ашиглан хөгжүүлэгдэнэ.

---

# MVP Scope

## MVP Goal

Эхний хувилбарын зорилго:

- Хэрэглэгч бүртгүүлэх
- Зар оруулах
- Зар хайх
- Category ашиглах
- Favorite хадгалах
- Report хийх
- Admin moderation хийх

боломжтой ажилладаг working system гаргах.

---

# MVP Features

## 1. Authentication Module

### Features
- Register
- Login
- Logout
- JWT Authentication
- Profile view
- Profile update

---

## 2. Advertisement Module

### Features
- Create ad
- Edit ad
- Delete ad
- Ad detail view
- Upload images
- Ad status update

---

## 3. Category Module

### Features
- Category list
- Subcategory list
- Category filter

---

## 4. Search Module

### Features
- Keyword search
- Category filter
- Price filter
- Location filter

---

## 5. Favorite Module

### Features
- Save favorite
- Remove favorite
- Favorite list

---

## 6. Report Module

### Features
- Report ad
- Report reason
- Admin review

---

## 7. Admin Module

### Features
- Hide ad
- Delete ad
- Block user
- View reports
- Dashboard statistics

---

# Features NOT Included in MVP

Эхний хувилбарт дараах feature-үүд орохгүй.

- Real-time chat
- Push notification
- Payment integration
- Boosted ads
- AI recommendation
- AI search
- Review/rating system
- iOS optimization
- Advanced analytics

---

# Development Plan

## Development Strategy

### Phase 1
NestJS Backend API + React Native Mobile App

### Phase 2
React Vite Admin Web Panel

---

# Sprint Plan

# Sprint 1 — Project Setup

## Backend Tasks

- NestJS project setup
- PostgreSQL setup
- Docker setup
- JWT configuration
- Base architecture setup

## Mobile Tasks

- React Native + Expo setup
- Navigation setup
- Global layout setup
- API client setup

## Deliverables

- Running backend server
- Running Expo mobile app
- Database connected

---

# Sprint 2 — Authentication Module

## Backend Tasks

- User entity
- Role entity
- Register API
- Login API
- JWT authentication
- Security configuration

## Mobile Tasks

- Register screen
- Login screen
- Authentication state
- Protected navigation

## Deliverables

- User registration works
- Login works
- Protected pages work

---

# Sprint 3 — Category + Advertisement Module

## Backend Tasks

- Category APIs
- Advertisement entity
- Create ad API
- Update ad API
- Delete ad API

## Mobile Tasks

- Home screen
- Category section
- Create ad screen
- Ad card component
- Ad detail screen

## Deliverables

- Ads can be created
- Ads visible on homepage

---

# Sprint 4 — Image Upload + Search

## Backend Tasks

- Image upload API
- File storage
- Search API
- Filter API

## Mobile Tasks

- Upload image UI
- Search bar
- Filter UI
- Search results screen

## Deliverables

- Search works
- Filters work
- Image upload works

---

# Sprint 5 — Favorite + Report

## Backend Tasks

- Favorite API
- Report API
- Report management

## Mobile Tasks

- Favorite button
- Favorite screen
- Report modal

## Deliverables

- Favorites work
- Report system works

---

# Sprint 6 — Admin API + Minimal Moderation

## Backend Tasks

- Admin APIs
- User block
- Hide ad
- Dashboard statistics
- Admin action log

## Admin Web Tasks

- React Vite admin setup
- Admin dashboard
- Report management page
- User management page

## Deliverables

- Admin moderation works

---

# Sprint 7 — Testing and Deployment

## Tasks

- API testing
- UI testing
- Bug fixing
- Docker deployment
- Production configuration

## Deliverables

- Deployable MVP system

---

# Recommended Team Structure

## Backend Developer
- NestJS
- Database
- APIs
- Security

## Frontend Web Developer
- React
- TailwindCSS
- Admin panel UI/UX

## Mobile Developer
- React Native
- API integration

## UI/UX Designer
- Figma
- Design system

---

# Suggested Git Branch Strategy

```text
main
develop
backend-auth
backend-ad
frontend-auth
frontend-home
mobile-auth
mobile-home
```

---

# Recommended Folder Structure

# Backend

```text
backend
 ├── auth
 ├── user
 ├── ad
 ├── category
 ├── favorite
 ├── report
 ├── admin
 └── common
```

---

# Admin Web

```text
admin-web
 ├── api
 ├── components
 ├── pages
 ├── features
 ├── routes
 └── store
```

---

# Mobile App

```text
mobile-app
 ├── api
 ├── screens
 ├── components
 ├── navigation
 └── store
```

---

# MVP Success Criteria

MVP successful гэж үзэх нөхцөл:

- User register/login хийж чаддаг
- Ads create/update/delete хийж чаддаг
- Search/filter ажилладаг
- React Native mobile app дээр үндсэн workflow ажилладаг
- Admin moderation ажилладаг
- Docker deployment successful байдаг

---

# Future Development Plan

## Future Features

- React Vite public web app
- Chat system
- Push notification
- AI search
- Recommendation system
- Verified seller
- Rating system
- Payment integration
- Cloud storage
- Microservice architecture
