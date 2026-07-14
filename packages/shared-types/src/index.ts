export type RoleName = "USER" | "ADMIN" | "MODERATOR";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BLOCKED";
export type AdvertisementStatus = "ACTIVE" | "SOLD" | "INACTIVE" | "EXPIRED" | "HIDDEN" | "DELETED";
export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";
export type ReportReason = "SPAM" | "FAKE" | "SCAM" | "DUPLICATE" | "INAPPROPRIATE" | "OTHER";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  userId: number;
  fullName: string;
  phone: string;
  email?: string;
  role: RoleName;
  status: UserStatus;
}

export interface Advertisement {
  adId: number;
  title: string;
  description: string;
  price?: number;
  status: AdvertisementStatus;
  categoryId: number;
  subcategoryId?: number;
  locationId?: number;
  userId: number;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  categoryId: number;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export interface Location {
  locationId: number;
  name: string;
  parentLocationId?: number;
  type: "city" | "district" | "province" | "sum";
}

export interface AdvertisementView {
  adId: number;
  title: string;
  description: string;
  price?: number;
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

export interface PublicAdvertisement extends AdvertisementView {
  status: "ACTIVE";
}

export interface OwnerAdvertisement extends AdvertisementView {
  status: AdvertisementStatus;
}

export interface PaginatedAds {
  items: PublicAdvertisement[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminStats {
  users: number;
  ads: number;
  activeAds: number;
  reports: number;
  categories: number;
}

export interface AdminReport {
  reportId: number;
  adId: number;
  adTitle: string;
  reporterName: string;
  reason: ReportReason;
  comment?: string;
  status: ReportStatus;
  createdAt: string;
}

export interface AdminActionLog {
  logId: number;
  adminName: string;
  actionType: string;
  targetType: string;
  targetId: number;
  description?: string;
  createdAt: string;
}

export interface AdminUser {
  userId: number;
  fullName: string;
  phone: string;
  email?: string;
  role: RoleName;
  status: UserStatus;
  locationName?: string;
  adCount: number;
  createdAt: string;
  updatedAt: string;
}
