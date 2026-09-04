export interface Ad {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  district: string;
  postedAt: string;
  image: string;
  category: string;
  subcategory: string;
  isFavorited: boolean;
  status?: "sold" | "inactive";
  isUrgent?: boolean;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  count: number;
}

export const CATEGORIES: Category[] = [
  { id: "vehicles", label: "Тээврийн хэрэгсэл", icon: "Car", count: 4820 },
  { id: "realestate", label: "Үл хөдлөх хөрөнгө", icon: "Building2", count: 3241 },
  { id: "electronics", label: "Электроник", icon: "Smartphone", count: 7903 },
  { id: "home", label: "Гэр ахуй", icon: "Sofa", count: 2156 },
  { id: "fashion", label: "Хувцас & Гутал", icon: "Shirt", count: 5417 },
  { id: "jobs", label: "Ажил & Үйлчилгээ", icon: "Briefcase", count: 1380 },
  { id: "sports", label: "Спорт & Хобби", icon: "Trophy", count: 892 },
  { id: "kids", label: "Хүүхдийн барааны", icon: "Baby", count: 1634 },
];

export const LOCATIONS = [
  "Улаанбаатар",
  "Дархан",
  "Эрдэнэт",
  "Баянхонгор",
  "Хөвсгөл",
  "Дорноговь",
  "Өмнөговь",
];

export const MOCK_ADS: Ad[] = [
  {
    id: "1",
    title: "Toyota Land Cruiser 200, 2018 он, цагаан өнгө",
    price: 128000000,
    currency: "₮",
    location: "Улаанбаатар",
    district: "Сүхбаатар дүүрэг",
    postedAt: "2025-08-28",
    image: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=600&h=450&fit=crop&auto=format",
    category: "vehicles",
    subcategory: "Машин",
    isFavorited: false,
    isUrgent: true,
  },
  {
    id: "2",
    title: "iPhone 15 Pro Max 256GB, шинэ, битүүмжлэгдсэн",
    price: 3200000,
    currency: "₮",
    location: "Улаанбаатар",
    district: "Баянзүрх дүүрэг",
    postedAt: "2025-08-27",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=450&fit=crop&auto=format",
    category: "electronics",
    subcategory: "Утас",
    isFavorited: true,
  },
  {
    id: "3",
    title: "2 өрөө орон сууц, 56м², Зайсан, дулаан шал",
    price: 185000000,
    currency: "₮",
    location: "Улаанбаатар",
    district: "Хан-Уул дүүрэг",
    postedAt: "2025-08-26",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=450&fit=crop&auto=format",
    category: "realestate",
    subcategory: "Орон сууц",
    isFavorited: false,
  },
  {
    id: "4",
    title: "MacBook Pro M3 14\", 16GB RAM, 512GB SSD",
    price: 4800000,
    currency: "₮",
    location: "Улаанбаатар",
    district: "Чингэлтэй дүүрэг",
    postedAt: "2025-08-25",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=450&fit=crop&auto=format",
    category: "electronics",
    subcategory: "Зөөврийн компьютер",
    isFavorited: false,
  },
  {
    id: "5",
    title: "Монгол гэрийн иж бүрдэл, шинэ, 6 хана",
    price: 12500000,
    currency: "₮",
    location: "Улаанбаатар",
    district: "Налайх дүүрэг",
    postedAt: "2025-08-24",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=450&fit=crop&auto=format",
    category: "home",
    subcategory: "Тавилга",
    isFavorited: false,
  },
  {
    id: "6",
    title: "Хонда СBR 600RR, 2020 он, улаан өнгө",
    price: 18500000,
    currency: "₮",
    location: "Улаанбаатар",
    district: "Баянгол дүүрэг",
    postedAt: "2025-08-23",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop&auto=format",
    category: "vehicles",
    subcategory: "Мотоцикл",
    isFavorited: true,
    status: "sold",
  },
  {
    id: "7",
    title: "Samsung 65\" QLED 4K телевизор, 2024 загвар",
    price: 2900000,
    currency: "₮",
    location: "Дархан",
    district: "Дархан хот",
    postedAt: "2025-08-22",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=450&fit=crop&auto=format",
    category: "electronics",
    subcategory: "Телевизор",
    isFavorited: false,
  },
  {
    id: "8",
    title: "Офис зориулалтын тавилга иж бүрдэл",
    price: 6400000,
    currency: "₮",
    location: "Улаанбаатар",
    district: "Сүхбаатар дүүрэг",
    postedAt: "2025-08-21",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=450&fit=crop&auto=format",
    category: "home",
    subcategory: "Офисын тавилга",
    isFavorited: false,
  },
];

export function formatPrice(price: number, currency: string): string {
  if (price >= 1000000) {
    return `${currency}${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)}сая`;
  }
  return `${currency}${price.toLocaleString("mn-MN")}`;
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Өнөөдөр";
  if (diffDays === 1) return "Өчигдөр";
  if (diffDays < 7) return `${diffDays} хоногийн өмнө`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 7 хоногийн өмнө`;
  return `${Math.floor(diffDays / 30)} сарын өмнө`;
}
