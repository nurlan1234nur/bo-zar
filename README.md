# BO Zar — Зар мэдээллийн платформ

BO Zar нь Баян-Өлгий болон Улаанбаатарын хэрэглэгчдэд зориулсан зарын платформ. NestJS API, PostgreSQL, public web, admin panel, Expo mobile app болон shared TypeScript package-ууд бүхий monorepo бүтэцтэй.

> Төлөв: Гол хэрэглэгчийн урсгалууд хэрэгжсэн. Docker Compose VPS deployment болон durable image storage бэлэн; production smoke test болон E2E баталгаажуулалт шаардлагатай.

Production deployment заавар: [docs/operations/deployment.md](docs/operations/deployment.md)

## Архитектур

```text
Mobile App ─┐
Public Web ─┼── REST API (NestJS) ── PostgreSQL
Admin Web  ─┘
```

## Бүтэц

- `backend/` — NestJS, TypeORM, PostgreSQL API
- `web-app/` — React/Vite public marketplace
- `admin-web/` — moderation болон admin интерфэйс
- `mobile-app/` — Expo/React Native client
- `packages/shared-types/` — shared contract
- `packages/api-client/` — shared REST client
- `packages/design-tokens/` — нэгдсэн дизайн утгууд

## Гол боломжууд

- Бүртгэл, нэвтрэлт, profile
- Зар харах, хайх, шүүх, эрэмбэлэх
- Зар үүсгэх, засах, төлөв өөрчлөх, soft-delete
- Зураг upload
- Favorites болон report
- Category, хэрэглэгч, зарын moderation

## Миний оролцоо

Шаардлага, архитектур, өгөгдлийн загвар, API болон web/admin/mobile integration дээр өөрөө болон AI-assisted байдлаар ажилласан. Гарсан кодыг ажиллуулж, засварлаж, build/test хийж ойлгоход анхаарсан.

## Баримт бичиг

- [Төслийн дэлгэрэнгүй](PROJECT_OVERVIEW.md)
- [Feature төлөв](docs/product/feature-status.md)
- [Системийн бүтэц](docs/architecture/system-overview.md)
- [Локал хөгжүүлэлт](docs/operations/local-development.md)
- [Roadmap](docs/planning/roadmap.md)

## Үндсэн шалгалтууд

```powershell
corepack pnpm --dir backend test -- --runInBand
corepack pnpm --dir backend build
corepack pnpm --dir web-app build
corepack pnpm --dir admin-web build
.\mobile-app\node_modules\.bin\tsc.CMD -p mobile-app\tsconfig.json --noEmit
```

Бодит `.env`, credential, token, log, upload болон хэрэглэгчийн хувийн мэдээллийг repository-д commit хийхгүй.

