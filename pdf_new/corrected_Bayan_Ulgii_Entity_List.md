# Corrected Entity List & Relationships

# Баян-Өлгий Иргэдэд Зориулсан Цогц Зар, Мэдээллийн Платформ

Хувилбар: MVP 1.0  
Огноо: 2026

---

# MVP Entities

| # | Entity | Тайлбар |
|---|---|---|
| 1 | User | Систем ашиглагч хэрэглэгч |
| 2 | Role | USER, ADMIN, MODERATOR эрх |
| 3 | Advertisement | Хэрэглэгчийн оруулсан зар |
| 4 | Category | Зарын үндсэн ангилал |
| 5 | SubCategory | Category доторх нарийвчилсан ангилал |
| 6 | Image | Зарын зураг |
| 7 | Location | Байршлын мэдээлэл |
| 8 | Favorite | Хадгалсан зар |
| 9 | Report | Зөрчилтэй зарын гомдол |
| 10 | AdminActionLog | Админы хийсэн үйлдлийн бүртгэл |

---

# Future Entities

| # | Entity | Тайлбар |
|---|---|---|
| 11 | ChatRoom | Чатын өрөө |
| 12 | Message | Чатын мессеж |
| 13 | Notification | Мэдэгдэл |
| 14 | Review / Rating | Хэрэглэгчийн үнэлгээ |

---

# 1. User

Attributes:

- user_id
- full_name
- phone
- email
- password_hash
- profile_image
- location_id
- role_id
- status
- created_at
- updated_at

Status:

- ACTIVE
- SUSPENDED
- BLOCKED

Relationships:

- User олон Advertisement үүсгэнэ.
- User олон Favorite үүсгэнэ.
- User олон Report илгээнэ.
- Admin User олон AdminActionLog үүсгэнэ.

---

# 2. Role

Attributes:

- role_id
- role_name

Role values:

- USER
- ADMIN
- MODERATOR

Note:

- Guest нь database role биш.

---

# 3. Advertisement

Attributes:

- ad_id
- user_id
- category_id
- subcategory_id
- location_id
- title
- description
- price
- status
- view_count
- contact_phone
- created_at
- updated_at
- expired_at

Status:

- ACTIVE
- SOLD
- INACTIVE
- EXPIRED
- HIDDEN
- DELETED

Relationships:

- User олон Advertisement үүсгэнэ.
- Category олон Advertisement-тэй.
- SubCategory олон Advertisement-тэй.
- Location олон Advertisement-тэй.
- Advertisement олон Image-тэй.
- Advertisement олон Favorite-тэй.
- Advertisement олон Report-той.

---

# 4. Category

Attributes:

- category_id
- name
- icon
- description
- is_active
- created_at

Examples:

- Түрээс
- Автомашин
- Гар утас
- Дайвар
- Ажил
- Үйлчилгээ
- Мэдээлэл

---

# 5. SubCategory

Attributes:

- subcategory_id
- category_id
- name
- description
- is_active

Examples:

- Түрээс: 1 өрөө, 2 өрөө, Roommate
- Авто: Машин, Сэлбэг, Унаа

---

# 6. Image

Attributes:

- image_id
- ad_id
- image_url
- thumbnail_url
- is_main
- uploaded_at

Rules:

- Image file type: jpg, jpeg, png, webp
- MVP max file size: 5MB
- Thumbnail үүсгэнэ.

---

# 7. Location

Attributes:

- location_id
- name
- parent_location_id
- type

Examples:

- Баян-Өлгий
- Өлгий сум
- Улаанбаатар
- Баянзүрх
- Хан-Уул
- УБ-БӨ чиглэл

---

# 8. Favorite

Attributes:

- favorite_id
- user_id
- ad_id
- created_at

Constraint:

- `user_id + ad_id` unique.

---

# 9. Report

Attributes:

- report_id
- reporter_user_id
- ad_id
- reason
- comment
- status
- created_at
- reviewed_at
- reviewed_by

Reason:

- SPAM
- FAKE
- SCAM
- DUPLICATE
- INAPPROPRIATE
- OTHER

Status:

- PENDING
- REVIEWED
- RESOLVED
- REJECTED

Constraint:

- `reporter_user_id + ad_id` unique.

---

# 10. AdminActionLog

Attributes:

- log_id
- admin_user_id
- action_type
- target_type
- target_id
- description
- created_at

Action types:

- DELETE_AD
- HIDE_AD
- BLOCK_USER
- SUSPEND_USER
- REVIEW_REPORT
- CREATE_CATEGORY
- UPDATE_CATEGORY

---

# Relationship Summary

| Entity A | Cardinality | Entity B | FK |
|---|---|---|---|
| Role | 1:N | User | role_id |
| User | 1:N | Advertisement | user_id |
| Category | 1:N | SubCategory | category_id |
| Category | 1:N | Advertisement | category_id |
| SubCategory | 1:N | Advertisement | subcategory_id |
| Location | 1:N | User | location_id |
| Location | 1:N | Advertisement | location_id |
| Advertisement | 1:N | Image | ad_id |
| User | 1:N | Favorite | user_id |
| Advertisement | 1:N | Favorite | ad_id |
| User | 1:N | Report | reporter_user_id |
| Advertisement | 1:N | Report | ad_id |
| User(Admin) | 1:N | AdminActionLog | admin_user_id |
