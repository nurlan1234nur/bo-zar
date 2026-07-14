# Current Monorepo Structure

> This archived document was sanitized during the 2026-07-14 documentation reorganization. Credential-like examples were replaced with placeholders.

Энэ бол одооноос ашиглах project folder structure. Web app болон React Native mobile app хоёулаа нэг NestJS backend API ашиглана.

```text
bo-zar-platform
├── backend
├── mobile-app
├── web-app
├── admin-web
├── packages
│   ├── shared-types
│   └── api-client
├── docs
│   ├── corrected
│   └── design-reference
├── nginx
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## backend

NestJS + TypeScript backend API.

```text
backend
├── src
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth
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
├── .env.example
└── README.md
```

## mobile-app

React Native + Expo mobile app.

```text
mobile-app
├── src
│   ├── api
│   ├── assets
│   ├── components
│   ├── screens
│   ├── navigation
│   ├── store
│   ├── types
│   ├── utils
│   └── App.tsx
├── app.json
├── package.json
├── .env.example
└── README.md
```

## web-app

React Vite public marketplace web app.

```text
web-app
├── public
├── src
│   ├── api
│   ├── assets
│   ├── components
│   ├── features
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
├── .env.example
└── README.md
```

## admin-web

React Vite admin and moderation panel.

```text
admin-web
├── public
├── src
│   ├── api
│   ├── components
│   ├── features
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
├── .env.example
└── README.md
```

## packages/shared-types

Backend, mobile, web, admin бүгд ашиглах TypeScript type-ууд.

```text
packages/shared-types
├── src
│   ├── user.ts
│   ├── advertisement.ts
│   ├── category.ts
│   ├── location.ts
│   ├── report.ts
│   ├── api.ts
│   └── index.ts
├── package.json
└── README.md
```

## packages/api-client

Mobile, web, admin гурав reuse хийх REST API client.

```text
packages/api-client
├── src
│   ├── client.ts
│   ├── authApi.ts
│   ├── usersApi.ts
│   ├── adsApi.ts
│   ├── categoriesApi.ts
│   ├── locationsApi.ts
│   ├── favoritesApi.ts
│   ├── reportsApi.ts
│   ├── adminApi.ts
│   └── index.ts
├── package.json
└── README.md
```

## Shared Backend Rule

All clients use the same API base:

```text
/api/v1
```

Environment examples:

```env
EXPO_PUBLIC_API_BASE_URL=<API_BASE_URL>
VITE_API_BASE_URL=<API_BASE_URL>
```

## Development Priority

1. `backend`
2. `packages/shared-types`
3. `packages/api-client`
4. `mobile-app`
5. `web-app`
6. `admin-web`
