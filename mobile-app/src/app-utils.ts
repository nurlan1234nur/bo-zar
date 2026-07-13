import { type PublicAdvertisement } from "@bozar/shared-types";

export type SearchSort = "newest" | "priceAsc" | "priceDesc" | "views";

export function formatPrice(price?: number) {
  return price ? `${price.toLocaleString("mn-MN")}₮` : "Тохиролцоно";
}

export function hasImage(imageUrl?: string) {
  return Boolean(imageUrl && imageUrl.trim().length > 0);
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = error.message.trim();
    const match = message.match(/^API request failed:\s*\d+\s*(.*)$/s);
    if (match?.[1]?.trim()) {
      return match[1].trim();
    }
    if (message) {
      return message;
    }
  }

  return fallback;
}

export function resolveImageUrlValue(imageUrl: string, apiAssetOrigin: string) {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:") || imageUrl.startsWith("file:")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${apiAssetOrigin}${imageUrl}`;
  }

  return imageUrl;
}

export function filterAds(
  ads: PublicAdvertisement[],
  options: {
    query: string;
    categoryId: number | "all";
    locationId: number | "all";
    sort: SearchSort;
  },
) {
  const query = options.query.trim().toLowerCase();

  const filtered = ads.filter((ad) => {
    const matchesQuery = !query || `${ad.title} ${ad.description} ${ad.locationName} ${ad.sellerName}`.toLowerCase().includes(query);
    const matchesCategory = options.categoryId === "all" || ad.categoryId === options.categoryId;
    const matchesLocation = options.locationId === "all" || ad.locationId === options.locationId;
    return matchesQuery && matchesCategory && matchesLocation;
  });

  const sorted = [...filtered];
  switch (options.sort) {
    case "priceAsc":
      sorted.sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
      break;
    case "priceDesc":
      sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case "views":
      sorted.sort((a, b) => b.viewCount - a.viewCount);
      break;
    case "newest":
    default:
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return sorted;
}
