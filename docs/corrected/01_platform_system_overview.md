# Corrected Bayan-Ulgii Platform System

# Баян-Өлгий Иргэдэд Зориулсан Цогц Зар, Мэдээллийн Платформ

Хувилбар: MVP 1.0  
Огноо: 2026  
Зассан stack: React Native + Expo, NestJS, PostgreSQL, React Vite Admin Web

---

# 1. Төслийн Танилцуулга

Энэхүү систем нь Баян-Өлгий аймгийн иргэд болон Улаанбаатар хотод сурч, ажиллаж, амьдарч байгаа Баян-Өлгийн иргэдэд зориулсан төвлөрсөн зар, худалдаа, мэдээллийн платформ юм.

Одоогийн байдлаар зар худалдаа, мэдээлэл солилцох үйл ажиллагаа Facebook группүүдээр дамжин явагддаг. Гэвч Facebook нь зарын систем биш тул хайлт, ангилал, filter, давхардсан зар ялгах, spam хянах тал дээр хүндрэлтэй.

---

# 2. Одоогийн Асуудлууд

- Зар олон Facebook группт тарсан байдаг.
- Давхардсан зар их.
- Category болон structured filter байхгүй.
- Хайлт exact keyword дээр хэт хамааралтай.
- Spam, meme, comment spam, хамааралгүй пост их.
- Private group, approve, membership зэрэг хязгаарлалттай.

---

# 3. Системийн Зорилго

Баян-Өлгий аймаг болон УБ хот дахь Баян-Өлгийн иргэдийн зар, худалдаа, мэдээллийн хэрэгцээнд зориулсан төвлөрсөн, ангилалтай, хайлттай, mobile-first платформ бий болгох.

---

# 4. Зорилтот Хэрэглэгчид

| # | Хэрэглэгч | Хэрэгцээ |
|---|---|---|
| 1 | Баян-Өлгий аймгийн иргэд | Аймаг доторх зар, худалдаа, мэдээлэл |
| 2 | УБ-д сурч буй БӨ оюутнууд | Байр, roommate, бараа, дайвар |
| 3 | УБ-д ажиллаж амьдарч буй БӨ иргэд | Хот дотор болон аймаг хоорондын үйлчилгээ |
| 4 | Зар тавигчид | Бараа, үйлчилгээ нийтлэх |
| 5 | Зар хайгчид | Хэрэгцээндээ таарсан зар хурдан олох |
| 6 | Admin / Moderator | Зөрчил, spam, report хянах |

---

# 5. Corrected System Architecture

```text
React Native Mobile App
          |
      REST API / JSON
          |
    NestJS Backend API
          |
      PostgreSQL
```

Admin:

```text
React Vite Admin Web
          |
      Same REST API
          |
    NestJS Backend API
```

---

# 6. MVP Үндсэн Боломжууд

- Register / Login / Logout
- Profile удирдлага
- Зар оруулах / засах / устгах
- Зураг upload хийх
- Category, subcategory сонгох
- Location сонгох
- Keyword search
- Category, location, price filter
- Favorite хадгалах
- Report илгээх
- Admin moderation
- User block/suspend
- Ad hide/delete
- Admin dashboard statistics

---

# 7. Боломжит Категориуд

- Түрээсийн байр
- Автомашин
- Гар утас
- Цахилгаан бараа
- Хувцас
- Ажил
- Дайвар / унаа
- Үйлчилгээ
- Мэдээлэл / зарлал
- Сургалт
- Оюутны зар

---

# 8. MVP-д Орохгүй Future Features

- Real-time chat
- Push notification
- AI search
- Recommendation system
- Payment
- Rating / review
- Verified seller
- Boosted ads
- Public web marketplace

---

# 9. Development Strategy

## Phase 1

NestJS Backend API + PostgreSQL + React Native Expo mobile app.

## Phase 2

React Vite admin web panel.

## Phase 3

Future public web marketplace болон advanced features.
