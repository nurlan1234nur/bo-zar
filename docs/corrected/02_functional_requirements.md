# Corrected Functional Requirements

# Баян-Өлгий Иргэдэд Зориулсан Цогц Зар, Мэдээллийн Платформ

Хувилбар: MVP 1.0  
Огноо: 2026  
Platform: React Native Mobile + NestJS Backend + PostgreSQL + React Vite Admin Web

---

# 1. Authentication

| ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-01 | Хэрэглэгч бүртгүүлэх | Guest | Must |
| FR-02 | Хэрэглэгч нэвтрэх | Guest | Must |
| FR-03 | Logout хийх | USER, ADMIN | Must |
| FR-04 | Профайл харах | USER | Must |
| FR-05 | Профайл засах | USER | Should |
| FR-06 | Нууц үг солих | USER | Should |
| FR-07 | Нууц үг сэргээх | Guest | Could |

Acceptance:

- Утасны дугаар unique байна.
- Password hash хэлбэрээр хадгалагдана.
- Login амжилттай бол JWT token үүснэ.
- Protected action хийхэд token шалгана.

---

# 2. Role / Permission

| ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-08 | Guest хэрэглэгч зар харах | Guest | Must |
| FR-09 | Guest хэрэглэгч хайлт хийх | Guest | Must |
| FR-10 | Guest зар оруулах боломжгүй байх | Guest | Must |
| FR-11 | Registered user зар оруулах | USER | Must |
| FR-12 | Registered user өөрийн зараа засах | USER | Must |
| FR-13 | Registered user өөрийн зараа устгах | USER | Must |
| FR-14 | Favorite ашиглах | USER | Should |
| FR-15 | Зар report хийх | USER | Should |
| FR-16 | Зар тавигчтай холбогдох | USER | Must |
| FR-17 | Admin зар удирдах | ADMIN, MODERATOR | Must |
| FR-18 | Admin хэрэглэгч удирдах | ADMIN | Must |
| FR-19 | Admin category удирдах | ADMIN | Should |
| FR-20 | Admin report review хийх | ADMIN, MODERATOR | Must |

Corrected roles:

- Guest: database role биш, token-гүй public user.
- USER
- ADMIN
- MODERATOR

---

# 3. Advertisement

| ID | Requirement | Priority |
|---|---|---|
| FR-21 | Шинэ зар үүсгэх | Must |
| FR-22 | Зураг upload хийх | Must |
| FR-23 | Зар update хийх | Must |
| FR-24 | Зар устгах | Must |
| FR-25 | Зар status update хийх | Must |
| FR-26 | Expired зар public list-ээс нуух | Must |
| FR-27 | Зөвхөн owner edit/delete хийх | Must |
| FR-28 | Зарын validation хийх | Must |
| FR-29 | created_at, updated_at хадгалах | Must |
| FR-30 | Soft delete ашиглах | Should |

Required fields:

- title
- description
- categoryId
- locationId
- contactPhone
- at least 1 image

Advertisement status:

- ACTIVE
- SOLD
- INACTIVE
- EXPIRED
- HIDDEN
- DELETED

---

# 4. Category / Subcategory

| ID | Requirement | Priority |
|---|---|---|
| FR-31 | Category list харах | Must |
| FR-32 | Subcategory list харах | Must |
| FR-33 | Category detail харах | Should |
| FR-34 | Category icon харуулах | Should |
| FR-35 | Category filter ашиглах | Must |
| FR-36 | Admin category нэмэх | Should |
| FR-37 | Admin category засах | Should |
| FR-38 | Admin category disable хийх | Should |
| FR-39 | Subcategory удирдах | Should |
| FR-40 | Inactive category public дээр нуух | Must |

---

# 5. Search / Filter

| ID | Requirement | Priority |
|---|---|---|
| FR-41 | Keyword search | Must |
| FR-42 | Category filter | Must |
| FR-43 | Price filter | Must |
| FR-44 | Sort хийх | Must |
| FR-45 | Default search active зар л харуулах | Must |
| FR-46 | Advanced filter | Should |
| FR-47 | Search history | Could |
| FR-48 | Trending search | Could |

Query params:

- page
- size
- keyword
- categoryId
- subcategoryId
- locationId
- minPrice
- maxPrice
- sort
- status

Sort values:

- newest
- oldest
- mostViewed
- priceAsc
- priceDesc

---

# 6. Ad Detail

| ID | Requirement | Priority |
|---|---|---|
| FR-49 | Зарын дэлгэрэнгүй харах | Must |
| FR-50 | Зарын зураг gallery | Must |
| FR-51 | Seller basic info харах | Must |
| FR-52 | Contact info харах | Must |
| FR-53 | Similar ads харуулах | Should |
| FR-54 | View count нэмэх | Should |

---

# 7. Favorite

| ID | Requirement | Priority |
|---|---|---|
| FR-55 | Favorite хадгалах | Should |
| FR-56 | Favorite list харах | Should |
| FR-57 | Favorite remove хийх | Should |

Rule:

- `favorites(user_id, ad_id)` unique байна.

---

# 8. Chat / Contact

| ID | Requirement | Priority |
|---|---|---|
| FR-58 | Chat эхлүүлэх | Could |
| FR-59 | Message илгээх | Could |
| FR-60 | Message history хадгалах | Could |
| FR-61 | Unread message indicator | Could |

MVP дээр chat орохгүй. Contact phone workflow ашиглана.

---

# 9. Report

| ID | Requirement | Priority |
|---|---|---|
| FR-62 | Зар report хийх | Must |
| FR-63 | Report comment бичих | Should |
| FR-64 | Report submit хийх | Must |
| FR-65 | Давтан report-оос хамгаалах | Should |

Report reasons:

- SPAM
- FAKE
- SCAM
- DUPLICATE
- INAPPROPRIATE
- OTHER

Report status:

- PENDING
- REVIEWED
- RESOLVED
- REJECTED

Rule:

- `reports(reporter_user_id, ad_id)` unique байна.

---

# 10. Admin / Moderation

| ID | Requirement | Priority |
|---|---|---|
| FR-66 | Admin reported ads харах | Must |
| FR-67 | Admin зар устгах | Must |
| FR-68 | Admin зар hide хийх | Must |
| FR-69 | Admin user suspend хийх | Must |
| FR-70 | Admin user block хийх | Must |
| FR-71 | Spam detection review | Should |
| FR-72 | Admin dashboard харах | Should |

Rule:

- Admin action бүр `admin_action_logs` table-д бүртгэгдэнэ.

---

# 11. Notification

| ID | Requirement | Priority |
|---|---|---|
| FR-73 | Message notification | Could |
| FR-74 | Ad expiry notification | Could |
| FR-75 | Favorite ad update notification | Could |

MVP-д орохгүй.

---

# 12. Content Quality

| ID | Requirement | Priority |
|---|---|---|
| FR-76 | Spam content detection | Should |
| FR-77 | Duplicate ad detection | Should |
| FR-78 | Expired ads hide хийх | Must |
| FR-79 | Inappropriate word filter | Could |

---

# 13. Functional бус шаардлагатай холбоотой FR

| ID | Requirement | Priority |
|---|---|---|
| FR-80 | Admin web responsive UI | Must |
| FR-81 | Fast loading | Must |
| FR-82 | Secure authentication | Must |
| FR-83 | Scalable architecture | Should |
| FR-84 | Image optimization | Should |
| FR-85 | Availability | Should |
