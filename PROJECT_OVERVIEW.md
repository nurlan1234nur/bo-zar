# BO Zar — Project Overview

## Нэг өгүүлбэрээр

BO Zar нь Баян-Өлгий болон Улаанбаатарын хэрэглэгчдэд зориулсан зарын нэгдсэн платформ бөгөөд public web, admin web, Expo mobile app, NestJS API болон PostgreSQL өгөгдлийн сантай monorepo төсөл юм.

## Миний оролцоо

- Бүтээгдэхүүний шаардлага, үндсэн хэрэглэгчийн урсгалыг тодорхойлсон.
- Backend, public web, admin panel, mobile client болон shared package-ууд дээр ажилласан.
- AI-г implementation, code review, debugging, documentation-д туслах хэрэгсэл болгон ашигласан.
- Гарсан кодыг уншиж, өөрчилж, build/test-ээр шалгаж, системийн хэсгүүдийг хооронд нь холбосон.

Энэ төслийг “бүх зүйл production-ready” гэж танилцуулахгүй. Харин олон client-тэй full-stack бүтээгдэхүүнийг архитектурчилж, хэрэгжүүлж буй бодит ажил гэж тайлбарлана.

## Архитектур

```text
Public Web ─┐
Admin Web  ─┼── REST API (NestJS) ── PostgreSQL
Mobile App ─┘              │
                    Local image storage
```

- `backend/` — NestJS, TypeORM, PostgreSQL
- `web-app/` — хэрэглэгчийн React/Vite веб
- `admin-web/` — moderation/admin интерфэйс
- `mobile-app/` — Expo/React Native client
- `packages/` — shared types, API client, design tokens

## Одоо ажилладаг гол боломжууд

- Бүртгэл, нэвтрэлт, session сэрublish
- Зар харах, хайх, filter/sort хийх
- Зар үүсгэх, засах, төлөв солих, soft-delete хийх
- Зураг upload хийх
- Favorites болон report
- Category, user, advertisement moderation
- Public web, admin болон mobile client-ийн API integration

## Дутуу болон сайжруулах хэсэг

- Deploy хийгдээгүй; live PostgreSQL болон production container verification шаардлагатай.
- Real-time chat, push notification, payment/promoted ads одоогоор төлөвлөгөө.
- Password reset-ийн client UI, audit attribution болон durable object storage дутуу.
- E2E test, monitoring, backup болон production security hardening нэмэх хэрэгтэй.

## Ярилцлагад тайлбарлах гол сэдэв

1. Яагаад monorepo болон shared TypeScript contract сонгосон бэ?
2. Public query, owner query, moderation query-г яагаад тусгаарласан бэ?
3. Upload амжилтгүй болох partial-failure үед өгөгдлийн consistency-г яаж хамгаалсан бэ?
4. Web, admin, mobile client-үүд нэг API-г хэрхэн өөр өөрөөр хэрэглэдэг вэ?
5. Production болгохын өмнө storage, test, observability-г яаж сайжруулах вэ?

## Portfolio-д хэрэглэх үнэн зөв тодорхойлолт

> AI-assisted байдлаар хөгжүүлсэн, web, admin, mobile client бүхий full-stack marketplace. Би шаардлага, архитектур, өгөгдлийн загвар, API integration болон хэрэглэгчийн гол урсгалууд дээр ажилласан. Төсөл идэвхтэй хөгжүүлэлтийн шатанд байгаа бөгөөд production deployment дараагийн зорилго юм.

