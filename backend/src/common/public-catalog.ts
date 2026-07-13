export interface PublicCategory {
  categoryId: number;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export interface PublicSubcategory {
  subcategoryId: number;
  categoryId: number;
  name: string;
}

export interface PublicLocation {
  locationId: number;
  name: string;
  parentLocationId?: number;
  type: "city" | "district" | "province" | "sum";
}

export interface PublicAd {
  adId: number;
  title: string;
  description: string;
  price?: number;
  status: "ACTIVE" | "SOLD";
  categoryId: number;
  subcategoryId?: number;
  locationId: number;
  locationName: string;
  sellerName: string;
  contactPhone: string;
  imageUrl: string;
  viewCount: number;
  createdAt: string;
}

export interface PublicAdminReport {
  reportId: number;
  adId: number;
  adTitle: string;
  reporterName: string;
  reason: "SPAM" | "FAKE" | "SCAM" | "DUPLICATE" | "INAPPROPRIATE" | "OTHER";
  comment?: string;
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";
  createdAt: string;
}

export const publicCategories: PublicCategory[] = [
  { categoryId: 1, name: "Түрээс", icon: "home", description: "Байр, өрөө, оффис түрээс", count: 128 },
  { categoryId: 2, name: "Автомашин", icon: "car", description: "Машин, сэлбэг, үйлчилгээ", count: 76 },
  { categoryId: 3, name: "Гар утас", icon: "smartphone", description: "Утас, дагалдах хэрэгсэл", count: 94 },
  { categoryId: 4, name: "Дайвар", icon: "route", description: "УБ-БӨ чиглэлийн дайвар", count: 43 },
  { categoryId: 5, name: "Ажил", icon: "briefcase", description: "Ажлын зар, үйлчилгээ", count: 31 },
  { categoryId: 6, name: "Үйлчилгээ", icon: "sparkles", description: "Засвар, сургалт, ахуйн үйлчилгээ", count: 58 },
];

export const publicSubcategories: PublicSubcategory[] = [
  { subcategoryId: 1, categoryId: 1, name: "Байр түрээс" },
  { subcategoryId: 2, categoryId: 1, name: "Өрөө түрээс" },
  { subcategoryId: 3, categoryId: 2, name: "Суудлын машин" },
  { subcategoryId: 4, categoryId: 3, name: "iPhone" },
  { subcategoryId: 5, categoryId: 4, name: "УБ-БӨ" },
  { subcategoryId: 6, categoryId: 5, name: "Цагийн ажил" },
];

export const publicLocations: PublicLocation[] = [
  { locationId: 1, name: "Улаанбаатар", type: "city" },
  { locationId: 2, name: "Баян-Өлгий", type: "province" },
  { locationId: 3, name: "Баянзүрх", parentLocationId: 1, type: "district" },
  { locationId: 4, name: "Сонгинохайрхан", parentLocationId: 1, type: "district" },
  { locationId: 5, name: "Өлгий сум", parentLocationId: 2, type: "sum" },
  { locationId: 6, name: "Цэнгэл сум", parentLocationId: 2, type: "sum" },
];

export const publicAds: PublicAd[] = [
  {
    adId: 1,
    title: "1 өрөө байр түрээслүүлнэ",
    description: "Оюутан болон гэр бүлд тохиромжтой, дулаан, цэвэр байр.",
    price: 800000,
    status: "ACTIVE",
    categoryId: 1,
    subcategoryId: 1,
    locationId: 3,
    locationName: "УБ, Баянзүрх",
    sellerName: "Ерлан А.",
    contactPhone: "99112233",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=700&fit=crop&auto=format",
    viewCount: 214,
    createdAt: "2026-06-28T08:00:00.000Z",
  },
  {
    adId: 2,
    title: "УБ-БӨ дайвар авна",
    description: "7 хоног бүр явна. Жижиг болон дунд оврын ачаа авна.",
    status: "ACTIVE",
    categoryId: 4,
    subcategoryId: 5,
    locationId: 1,
    locationName: "УБ-БӨ чиглэл",
    sellerName: "Бек Н.",
    contactPhone: "88114455",
    imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&h=700&fit=crop&auto=format",
    viewCount: 96,
    createdAt: "2026-06-27T09:30:00.000Z",
  },
  {
    adId: 3,
    title: "iPhone 13 зарна",
    description: "128GB, battery 88%, хайрцаг цэнэглэгчтэй.",
    price: 1400000,
    status: "ACTIVE",
    categoryId: 3,
    subcategoryId: 4,
    locationId: 5,
    locationName: "Өлгий сум",
    sellerName: "Айгерим К.",
    contactPhone: "99776655",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&h=700&fit=crop&auto=format",
    viewCount: 173,
    createdAt: "2026-06-26T12:15:00.000Z",
  },
  {
    adId: 4,
    title: "Toyota Prius 30 зарна",
    description: "Монголд орж ирээд удаагүй, цэвэрхэн салонтой.",
    price: 18500000,
    status: "ACTIVE",
    categoryId: 2,
    subcategoryId: 3,
    locationId: 4,
    locationName: "УБ, Сонгинохайрхан",
    sellerName: "Нурбол Т.",
    contactPhone: "99001122",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&h=700&fit=crop&auto=format",
    viewCount: 311,
    createdAt: "2026-06-25T10:45:00.000Z",
  },
];

export const publicAdminReports: PublicAdminReport[] = [
  {
    reportId: 1,
    adId: 2,
    adTitle: "УБ-БӨ дайвар авна",
    reporterName: "Сара А.",
    reason: "DUPLICATE",
    comment: "Ижил зар олон удаа орсон байна.",
    status: "PENDING",
    createdAt: "2026-06-29T07:40:00.000Z",
  },
  {
    reportId: 2,
    adId: 3,
    adTitle: "iPhone 13 зарна",
    reporterName: "Темир Б.",
    reason: "SCAM",
    comment: "Үнэ болон мэдээлэл зөрж байна.",
    status: "REVIEWED",
    createdAt: "2026-06-28T11:20:00.000Z",
  },
];
