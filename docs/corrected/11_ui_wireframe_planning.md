
# UI Screen List and Wireframe Planning

# Overview

Энэхүү баримт бичиг нь Баян-Өлгий зар, мэдээллийн платформын:

- React Native Mobile UI
- React Vite Admin Web UI
- Future Public Web UI

screen-үүд болон wireframe planning-ийг тодорхойлно.

---

# Design Philosophy

Системийн UI дараах зарчмыг баримтална.

- Facebook post хийхтэй адил энгийн байх
- Mobile-first UX ашиглах
- Цэвэрхэн minimal design
- Хурдан ойлгогдох navigation
- Search-centric experience
- Category-based browsing

---

# Color Palette

## Primary Color
- Blue
- Dark Blue

## Secondary Color
- White
- Light Gray

## Accent Color
- Green (success)
- Red (report/error)

---

# Typography

## Fonts
- Inter
- Roboto
- System font fallback

---

# Mobile Application Screens

# 1. Mobile Home Screen

## Components

- Top search bar
- Category slider
- Latest ads
- Bottom navigation

---

# 2. Mobile Search Screen

## Features

- Search input
- Filters
- Search result list

---

# 3. Mobile Ad Detail Screen

## Components

- Swipeable image gallery
- Ad information
- Contact button
- Favorite button

---

# 4. Mobile Create Ad Screen

## Features

- Mobile-friendly form
- Camera upload
- Gallery upload

---

# 5. Mobile Edit Ad Screen

## Features

- Update title, description, price, category, location
- Change images
- Mark as sold
- Delete ad

---

# 6. Mobile Profile Screen

## Features

- User info
- My ads
- Favorites
- Settings

---

# 7. Mobile Authentication Screens

## Register Fields

- Full name
- Phone
- Email
- Password

## Login Fields

- Phone or Email
- Password

---

# Admin Web Screens

# 1. Admin Dashboard

## Purpose
Admin moderation system.

## Components

- Statistics cards
- Recent reports
- User management
- Ad moderation
- Category management

---

# 2. Report Management Page

## Purpose
Reported ads review хийх.

## Features

- Report list
- Report reason
- Hide/Delete ad
- Resolve report

---

# 3. User Management Page

## Purpose
Хэрэглэгч block/suspend хийх.

## Features

- User list
- User status
- Block user
- Suspend user

---

# 4. Category Management Page

## Purpose
Category болон subcategory удирдах.

## Features

- Create category
- Edit category
- Disable category
- Manage subcategories

---

# Future Public Web Screens

# 1. Landing / Home Page

## Purpose
Хэрэглэгчид зар харах, category сонгох, search хийх үндсэн web нүүр.

## Components

- Navbar
- Logo
- Search bar
- Category section
- Featured ads
- Latest ads
- Footer

---

# 2. Advertisement List Page

## Purpose
Category эсвэл search result харуулах.

## Components

- Search bar
- Filter sidebar
- Category filter
- Price filter
- Location filter
- Ad cards
- Pagination / Infinite scroll

---

# 3. Advertisement Detail Page

## Purpose
Нэг зарын дэлгэрэнгүй мэдээлэл.

## Components

- Image gallery
- Ad title
- Price
- Description
- Seller information
- Contact button
- Favorite button
- Report button
- Similar ads

---

# 4. Create Advertisement Page

## Purpose
Шинэ зар оруулах.

## Form Fields

- Title
- Description
- Category
- Subcategory
- Price
- Location
- Images
- Contact phone

## Actions

- Save draft
- Publish ad

---

# 5. Edit Advertisement Page

## Purpose
Өөрийн зараа засах.

## Features

- Update information
- Change images
- Update status
- Delete ad

---

# 6. User Profile Page

## Purpose
Хэрэглэгчийн profile болон activity.

## Sections

- User info
- My ads
- Favorites
- Reports
- Settings

---

# 7. Favorite Page

## Purpose
Saved ads жагсаалт.

## Features

- View favorites
- Remove favorite
- Open ad detail

---

# Navigation Structure

# Web Navigation

```text
Admin
 ├── Dashboard
 ├── Reports
 ├── Ads
 ├── Users
 └── Categories
```

---

# Mobile Navigation

```text
Bottom Navigation

Home
Search
Create Ad
Favorites
Profile
```

---

# Shared Components

## Common Components

- Navbar
- SearchBar
- AdCard
- CategoryCard
- ImageGallery
- LoadingSpinner
- ErrorMessage
- Pagination
- Modal

---

# Design System

## Buttons

### Primary Button
- Create Ad
- Login
- Publish

### Secondary Button
- Cancel
- Back

### Danger Button
- Delete
- Report

---

# Responsive Design Rules

## Mobile
- Single column layout

## Tablet
- Two column layout

## Desktop
- Multi-column grid layout

---

# Accessibility Rules

- Readable font sizes
- High contrast colors
- Large clickable buttons
- Clear error messages

---

# Future UI Features

## Future Screens

- Chat screen
- Notification center
- Review/rating page
- Boosted ads page
- Analytics dashboard

---

# UI Development Priority

# Phase 1

- Mobile Home
- Mobile Login/Register
- Mobile Ad list
- Mobile Ad detail

---

# Phase 2

- Mobile Create/Edit ad
- Mobile Favorites
- Mobile Profile

---

# Phase 3

- Admin dashboard
- Moderation screens

---

# Phase 4

- Future public web app

---

# Suggested UI Workflow

1. Figma Design
2. Design System
3. React Native Components
4. Responsive Admin Layout
5. API Integration
6. Testing
