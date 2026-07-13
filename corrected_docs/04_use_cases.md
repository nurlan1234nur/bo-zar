# Corrected Use Case Document

# Баян-Өлгий Иргэдэд Зориулсан Цогц Зар, Мэдээллийн Платформ

Хувилбар: MVP 1.0  
Огноо: 2026

---

# Actors

| Actor | Тайлбар |
|---|---|
| Guest | Нэвтрээгүй хэрэглэгч, database role биш |
| USER | Бүртгэлтэй хэрэглэгч |
| ADMIN | Системийн администратор |
| MODERATOR | Хяналтын хэрэглэгч |

---

# Use Case Overview

| ID | Use Case | Actor |
|---|---|---|
| UC-01 | Зар харах | Guest |
| UC-02 | Зар хайх | Guest |
| UC-03 | Category харах | Guest |
| UC-04 | Зарын дэлгэрэнгүй харах | Guest |
| UC-05 | Бүртгүүлэх | Guest |
| UC-06 | Нэвтрэх | Guest |
| UC-07 | Зар оруулах | USER |
| UC-08 | Өөрийн зараа засах | USER |
| UC-09 | Өөрийн зараа устгах | USER |
| UC-10 | Зар favorite хадгалах | USER |
| UC-11 | Favorite list харах | USER |
| UC-12 | Зар report хийх | USER |
| UC-13 | Профайл удирдах | USER |
| UC-14 | Зар тавигчтай холбогдох | USER |
| UC-15 | Зураг upload хийх | USER |
| UC-16 | Report шалгах | ADMIN / MODERATOR |
| UC-17 | Зар hide хийх | ADMIN / MODERATOR |
| UC-18 | Зар устгах | ADMIN / MODERATOR |
| UC-19 | Хэрэглэгч block/suspend хийх | ADMIN |
| UC-20 | Category удирдах | ADMIN |
| UC-21 | Admin dashboard харах | ADMIN / MODERATOR |

---

# Guest Use Cases

## UC-01 — Зар харах

Guest хэрэглэгч public ACTIVE заруудыг харна.

## UC-02 — Зар хайх

Guest keyword, category, subcategory, location, price filter ашиглан зар хайна.

## UC-03 — Category харах

Guest active category болон subcategory жагсаалтыг харна.

## UC-04 — Зарын дэлгэрэнгүй харах

Guest зарын зураг, гарчиг, үнэ, тайлбар, байршил, seller basic info, contact info харна.

## UC-05 — Бүртгүүлэх

Guest нэр, утас, email, password ашиглан account үүсгэнэ.

## UC-06 — Нэвтрэх

Guest утас/email болон password ашиглан login хийж JWT token авна.

---

# Registered User Use Cases

## UC-07 — Зар оруулах

Precondition: USER login хийсэн байна.

Main flow:

1. USER "Зар нэмэх" дарна.
2. Mobile app зар оруулах form харуулна.
3. USER title, description, price, category, location, contact phone оруулна.
4. USER зураг upload хийнэ.
5. Publish дарна.
6. Backend validation хийнэ.
7. Зар ACTIVE status-тай хадгалагдана.

Postcondition: Зар public list дээр харагдана.

## UC-08 — Өөрийн зараа засах

Precondition: USER тухайн зарын owner байна.

Main flow:

1. USER өөрийн зарын detail рүү орно.
2. Edit дарна.
3. Мэдээллээ өөрчилнө.
4. Save дарна.
5. Backend owner шалгаад update хийнэ.

## UC-09 — Өөрийн зараа устгах

Precondition: USER тухайн зарын owner байна.

Main flow:

1. Delete дарна.
2. Confirmation харуулна.
3. USER баталгаажуулна.
4. Зар DELETED эсвэл INACTIVE status-тай болно.

## UC-10 — Favorite хадгалах

USER зарын card/detail дээр favorite дарна. Давхардсан favorite үүсэхгүй.

## UC-11 — Favorite list харах

USER profile эсвэл favorites tab-аас хадгалсан заруудыг харна.

## UC-12 — Зар report хийх

USER report reason сонгож, comment бичээд submit хийнэ. Report admin panel руу очно.

## UC-13 — Профайл удирдах

USER нэр, email, байршил, profile image засна.

## UC-14 — Зар тавигчтай холбогдох

MVP дээр USER contact phone ашиглаж холбогдоно. Chat future scope.

## UC-15 — Зураг upload хийх

USER image сонгоно. Backend file type, size шалгаж хадгална, thumbnail үүсгэнэ.

---

# Admin / Moderator Use Cases

## UC-16 — Report шалгах

Admin report dashboard руу орж, report reason, ad detail, reporter info харж шийдвэр гаргана.

## UC-17 — Зар hide хийх

Admin/MODERATOR зөрчилтэй зарыг HIDDEN status болгож public list-ээс нууж чадна.

## UC-18 — Зар устгах

Admin/MODERATOR зарыг DELETED status болгож устгана.

## UC-19 — Хэрэглэгч block/suspend хийх

Admin хэрэглэгчийг SUSPENDED эсвэл BLOCKED status болгоно.

## UC-20 — Category удирдах

Admin category/subcategory нэмэх, засах, disable хийх боломжтой.

## UC-21 — Admin dashboard харах

Admin нийт хэрэглэгч, нийт зар, active зар, report count, recent reports харна.

---

# Admin Action Logging

UC-16-аас UC-21 хүртэлх admin action бүр `admin_action_logs` table-д хадгалагдана.
