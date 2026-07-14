# Corrected Non-Functional Requirements

# Баян-Өлгий Иргэдэд Зориулсан Цогц Зар, Мэдээллийн Платформ

Platform: React Native + Expo, NestJS, PostgreSQL, React Vite Admin Web  
Хувилбар: MVP 1.0  
Огноо: 2026

---

# 1. Performance

| ID | Requirement |
|---|---|
| NFR-01 | Mobile home болон admin dashboard 3 секундээс бага хугацаанд ачаална |
| NFR-02 | Search result 1-2 секундийн дотор ирнэ |
| NFR-03 | Эхний хувилбарт 500-1000 concurrent user дэмжихээр төлөвлөнө |

Implementation:

- Pagination эсвэл infinite scroll ашиглана.
- Зураг lazy loading ашиглана.
- Search-д index ашиглана.

---

# 2. Security

| ID | Requirement |
|---|---|
| NFR-04 | Password hash, JWT, login attempt protection ашиглана |
| NFR-05 | Role-based access control хэрэгжинэ |
| NFR-06 | API validation, SQL injection, XSS, CSRF хамгаалалттай байна |
| NFR-07 | Хэрэглэгчийн хувийн мэдээллийг зөвшөөрөлгүй харуулахгүй |

Corrected roles:

- Guest token-гүй public state.
- USER, ADMIN, MODERATOR нь database role.

---

# 3. Usability

| ID | Requirement |
|---|---|
| NFR-08 | Зар оруулах form Facebook post бичихтэй адил энгийн байна |
| NFR-09 | Mobile-first UX ашиглана |
| NFR-10 | Admin web responsive байна |

---

# 4. Cross-platform

| ID | Requirement |
|---|---|
| NFR-11 | Mobile app болон admin web нэг backend API ашиглана |
| NFR-12 | Category, status, error message хоёр platform дээр ижил байна |

---

# 5. Reliability

| ID | Requirement |
|---|---|
| NFR-13 | Database transaction ашиглана |
| NFR-14 | Daily database backup хийх боломжтой байна |

---

# 6. Availability

| ID | Requirement |
|---|---|
| NFR-15 | System uptime өндөр байна, backend down үед ойлгомжтой error харуулна |

---

# 7. Scalability

| ID | Requirement |
|---|---|
| NFR-16 | Modular monolith NestJS architecture ашиглана |
| NFR-17 | Image storage өргөтгөх боломжтой байна |

Future:

- Cloud/object storage
- Notification service
- AI search
- Recommendation system

---

# 8. Maintainability

| ID | Requirement |
|---|---|
| NFR-18 | Backend module-based, mobile component-based бүтэцтэй байна |
| NFR-19 | Requirement, ERD, API, setup, deployment docs байна |

---

# 9. Compatibility

| ID | Requirement |
|---|---|
| NFR-20 | Admin web Chrome, Edge, Safari, Firefox дээр ажиллана |
| NFR-21 | Mobile app Android priority, iOS future support байна |

---

# 10. Data Requirements

| ID | Requirement |
|---|---|
| NFR-22 | Зар, хэрэглэгч, category, report өгөгдөл зөрчилгүй байна |
| NFR-23 | Frontend болон backend validation хийнэ |

Important constraints:

- `users.phone` unique
- `favorites(user_id, ad_id)` unique
- `reports(reporter_user_id, ad_id)` unique
- Default search зөвхөн ACTIVE зар харуулна.

---

# 11. Network

| ID | Requirement |
|---|---|
| NFR-24 | Сүлжээ муу үед loading, retry, error state харуулна |

---

# 12. Moderation & Content Quality

| ID | Requirement |
|---|---|
| NFR-25 | Report болон admin moderation байна |
| NFR-26 | Зар бүр ойлгомжтой, зурагтай, байршилтай байна |

---

# 13. Localization

| ID | Requirement |
|---|---|
| NFR-27 | UI text Монгол хэл дээр байна |
| NFR-28 | Баян-Өлгийн хэрэглэгчдэд тохирсон нэршил ашиглана |

Examples:

- Дайвар
- Унаа
- Түрээс
- Оюутны байр
- УБ-БӨ чиглэл

---

# 14. Logging & Monitoring

| ID | Requirement |
|---|---|
| NFR-29 | Backend error, API request, login, ad creation log хадгална |
| NFR-30 | Admin action бүр бүртгэгдэнэ |

Admin action log fields:

- admin_user_id
- action_type
- target_type
- target_id
- description
- created_at

---

# 15. Deployment

| ID | Requirement |
|---|---|
| NFR-31 | Docker ашиглан backend, admin web, database deploy хийх боломжтой байна |
| NFR-32 | Development, testing, production env config тусдаа байна |

---

# 16. Testing

| ID | Requirement |
|---|---|
| NFR-33 | Backend API tests байна |
| NFR-34 | Mobile болон admin web гол workflow test-тэй байна |

---

# 17. Accessibility

| ID | Requirement |
|---|---|
| NFR-35 | Font, button, contrast, error message ойлгомжтой байна |

---

# 18. MVP-д Заавал Оруулах NFR

- Fast loading
- Secure authentication
- Role-based access control
- Mobile-first design
- API-first backend
- Data validation
- Image optimization
- Admin moderation
- Docker deployment
- Database backup
- Clean modular NestJS architecture
