# Bayan-Ulgii Marketplace Platform

Баян-Өлгий аймаг болон Улаанбаатар хотод байгаа Баян-Өлгийн иргэдэд зориулсан зар, худалдаа, мэдээллийн платформ.

## Architecture

```text
mobile-app  ┐
web-app     ├── REST API / JSON ── backend ── PostgreSQL
admin-web   ┘
```

## Workspace Structure

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
│   └── corrected
├── nginx
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Apps

- `backend`: NestJS + TypeScript API, PostgreSQL-тэй ажиллана.
- `mobile-app`: React Native + Expo хэрэглэгчийн mobile app.
- `web-app`: React Vite public marketplace web app.
- `admin-web`: React Vite admin/moderation panel.

## Shared Packages

- `packages/shared-types`: backend, mobile, web, admin бүгд ашиглах TypeScript type-ууд.
- `packages/api-client`: нэг REST API client logic.

## Docs

Цааш ашиглах зассан баримтууд:

- `docs/corrected/00_master_corrected_system_spec.md`
- `docs/corrected/06_erd_database_schema.md`
- `docs/corrected/07_api_design.md`
- `docs/corrected/09_folder_structure.md`

## Development Order

1. Backend API schema/entities
2. Shared types
3. API client
4. Mobile app MVP
5. Web app MVP
6. Admin web panel
