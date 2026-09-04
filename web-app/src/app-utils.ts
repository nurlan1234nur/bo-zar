import { ApiClientError } from "@bozar/api-client";

export type AdSort = "newest" | "oldest" | "mostViewed" | "priceAsc" | "priceDesc";
export type BrowseFilters = { keyword: string; categoryId: number; subcategoryId: number; locationId: number; sort: AdSort; minPrice: string; maxPrice: string; page: number };
const allowedSorts = new Set<AdSort>(["newest", "oldest", "mostViewed", "priceAsc", "priceDesc"]);
function positiveInt(value: string | null, fallback = 0) { const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback; }
function priceValue(value: string | null) { return value !== null && /^\d+(?:\.\d{1,2})?$/.test(value) ? value : ""; }

export function parseBrowseFilters(search: string): BrowseFilters {
  const query = new URLSearchParams(search);
  const sort = query.get("sort") as AdSort | null;
  return { keyword: (query.get("keyword") ?? "").trim().slice(0, 200), categoryId: positiveInt(query.get("categoryId")), subcategoryId: positiveInt(query.get("subcategoryId")), locationId: positiveInt(query.get("locationId")), sort: sort && allowedSorts.has(sort) ? sort : "newest", minPrice: priceValue(query.get("minPrice")), maxPrice: priceValue(query.get("maxPrice")), page: positiveInt(query.get("page"), 1) };
}

export function serializeBrowseFilters(filters: BrowseFilters) {
  const query = new URLSearchParams();
  if (filters.keyword.trim()) query.set("keyword", filters.keyword.trim());
  if (filters.categoryId) query.set("categoryId", String(filters.categoryId));
  if (filters.subcategoryId) query.set("subcategoryId", String(filters.subcategoryId));
  if (filters.locationId) query.set("locationId", String(filters.locationId));
  if (filters.minPrice) query.set("minPrice", filters.minPrice);
  if (filters.maxPrice) query.set("maxPrice", filters.maxPrice);
  if (filters.sort !== "newest") query.set("sort", filters.sort);
  if (filters.page > 1) query.set("page", String(filters.page));
  return query.toString();
}

export type AuthSessionLike = {
  token: string;
  user: unknown;
};

export type AuthResponseLike<T extends AuthSessionLike> = {
  data?: T;
  token?: string;
  user?: T["user"];
};

export function formatPrice(price?: number) {
  return price ? `${price.toLocaleString("mn-MN")}₮` : "Тохиролцоно";
}

export function hasImage(imageUrl?: string) {
  return Boolean(imageUrl && imageUrl.trim().length > 0);
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError && error.code === "PROFILE_VALIDATION_FAILED") return "Профайлын мэдээллээ шалгаад дахин оролдоно уу.";
  if (error instanceof ApiClientError && error.status === 403) return "Энэ үйлдлийг хийх эрх хүрэхгүй байна.";
  if (error instanceof ApiClientError && error.status === 429) return "Хэт олон хүсэлт илгээсэн байна. Түр хүлээгээд дахин оролдоно уу.";
  return fallback;
}

export function resolveImageUrlValue(imageUrl: string, apiAssetOrigin: string) {
  const normalized = imageUrl.trim();
  if (!normalized) return "";

  const isBackendRelative = normalized.startsWith("uploads/") || normalized.startsWith("/uploads/");
  if (isBackendRelative) {
    const path = normalized.split(/[?#]/, 1)[0];
    const hasTraversalSegment = path.split("/").some((segment) => {
      let decoded = segment;
      for (let pass = 0; pass < 3; pass += 1) {
        try {
          const next = decodeURIComponent(decoded);
          if (next === decoded) break;
          decoded = next;
        } catch {
          return true;
        }
      }
      return decoded.split(/[\\/]/).some((part) => part === "." || part === "..");
    });
    if (hasTraversalSegment) return "";

    try {
      const expectedOrigin = new URL(apiAssetOrigin).origin;
      const canonical = new URL(normalized.startsWith("/") ? normalized : `/${normalized}`, expectedOrigin);
      if (canonical.origin !== expectedOrigin || !canonical.pathname.startsWith("/uploads/") || canonical.pathname === "/uploads/") return "";
      return canonical.href;
    } catch {
      return "";
    }
  }

  try {
    const parsed = new URL(normalized);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? normalized : "";
  } catch {
    return "";
  }
}

export function readAuthResponse<T extends AuthSessionLike>(response: AuthResponseLike<T>): T {
  const data = (response.data ?? response) as T;
  if (!data.token || !data.user) {
    throw new Error("Invalid auth response");
  }
  return { token: data.token, user: data.user } as T;
}
