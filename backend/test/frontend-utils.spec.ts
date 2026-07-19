import { filterAdminReports, filterAdminUsers } from "../../admin-web/src/app-utils";
import {
  formatPrice as formatMobilePrice,
  filterAds,
  resolveImageUrlValue as resolveMobileImageUrl,
} from "../../mobile-app/src/app-utils";
import {
  formatPrice as formatWebPrice,
  getApiErrorMessage,
  hasImage,
  readAuthResponse,
  resolveImageUrlValue as resolveWebImageUrl,
} from "../../web-app/src/app-utils";
import { type AdminReport, type AdminUser, type PublicAdvertisement } from "../../packages/shared-types/src";
import { ApiClientError } from "../../packages/api-client/src";

describe("frontend utility logic", () => {
  it("formats prices and detects images consistently", () => {
    expect(formatWebPrice(1200000)).toBe("1,200,000₮");
    expect(formatMobilePrice(undefined)).toBe("Тохиролцоно");
    expect(hasImage("  /uploads/ad.jpg  ")).toBe(true);
    expect(hasImage("   ")).toBe(false);
  });

  it("resolves API-hosted and already absolute image URLs", () => {
    expect(resolveWebImageUrl("/uploads/ad.jpg", "http://localhost:8080")).toBe("http://localhost:8080/uploads/ad.jpg");
    expect(resolveWebImageUrl("https://example.com/ad.jpg", "http://localhost:8080")).toBe("https://example.com/ad.jpg");
    expect(resolveMobileImageUrl("file:///tmp/ad.jpg", "http://localhost:8080")).toBe("file:///tmp/ad.jpg");
  });

  it("normalizes API error messages and auth responses", () => {
    expect(getApiErrorMessage(new Error("API request failed: 401 Unauthorized secret-token"), "fallback")).toBe("fallback");
    expect(getApiErrorMessage(new Error("Plain error Error at private.ts:1"), "fallback")).toBe("fallback");
    expect(getApiErrorMessage(new ApiClientError(403), "fallback")).toBe("Энэ үйлдлийг хийх эрх хүрэхгүй байна.");
    expect(getApiErrorMessage("not an error", "fallback")).toBe("fallback");

    expect(readAuthResponse({ data: { token: "token", user: { userId: 1 } } })).toEqual({
      token: "token",
      user: { userId: 1 },
    });
    expect(() => readAuthResponse({ data: { token: "", user: undefined } })).toThrow("Invalid auth response");
  });

  it("filters and sorts mobile ads by query, category, location, price, views, and date", () => {
    const ads: PublicAdvertisement[] = [
      createAd({ adId: 1, title: "Old phone", price: 300, categoryId: 2, locationId: 1, viewCount: 5, createdAt: "2026-01-01T00:00:00.000Z" }),
      createAd({ adId: 2, title: "New apartment", price: 900, categoryId: 1, locationId: 2, viewCount: 20, createdAt: "2026-03-01T00:00:00.000Z" }),
      createAd({ adId: 3, title: "Cheap apartment", price: 100, categoryId: 1, locationId: 2, viewCount: 10, createdAt: "2026-02-01T00:00:00.000Z" }),
    ];

    expect(filterAds(ads, { query: "apartment", categoryId: 1, locationId: 2, sort: "priceAsc" }).map((ad) => ad.adId)).toEqual([3, 2]);
    expect(filterAds(ads, { query: "", categoryId: "all", locationId: "all", sort: "priceDesc" }).map((ad) => ad.adId)).toEqual([2, 1, 3]);
    expect(filterAds(ads, { query: "", categoryId: "all", locationId: "all", sort: "views" }).map((ad) => ad.adId)).toEqual([2, 3, 1]);
    expect(filterAds(ads, { query: "", categoryId: "all", locationId: "all", sort: "newest" }).map((ad) => ad.adId)).toEqual([2, 3, 1]);
  });

  it("filters admin reports and users for dashboard views", () => {
    const reports: AdminReport[] = [
      createReport({ reportId: 1, status: "PENDING" }),
      createReport({ reportId: 2, status: "REVIEWED" }),
      createReport({ reportId: 3, status: "RESOLVED" }),
    ];
    expect(filterAdminReports(reports, "pending").map((report) => report.reportId)).toEqual([1]);
    expect(filterAdminReports(reports, "reviewed").map((report) => report.reportId)).toEqual([2]);
    expect(filterAdminReports(reports, "all").map((report) => report.reportId)).toEqual([1, 2, 3]);

    const users: AdminUser[] = [
      createUser({ userId: 1, fullName: "Admin User", status: "ACTIVE", locationName: "Ulgii" }),
      createUser({ userId: 2, fullName: "Blocked Seller", status: "BLOCKED", phone: "99001122" }),
      createUser({ userId: 3, fullName: "Suspended Seller", status: "SUSPENDED", email: "seller@example.com" }),
    ];

    expect(filterAdminUsers(users, "blocked", "").map((user) => user.userId)).toEqual([2]);
    expect(filterAdminUsers(users, "all", "seller").map((user) => user.userId)).toEqual([2, 3]);
    expect(filterAdminUsers(users, "active", "ulgii").map((user) => user.userId)).toEqual([1]);
  });
});

function createAd(overrides: Partial<PublicAdvertisement>): PublicAdvertisement {
  return {
    adId: 1,
    title: "Ad",
    description: "Description",
    status: "ACTIVE",
    categoryId: 1,
    locationId: 1,
    locationName: "Ulgii",
    sellerName: "Seller",
    contactPhone: "99112233",
    imageUrl: "",
    viewCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createReport(overrides: Partial<AdminReport>): AdminReport {
  return {
    reportId: 1,
    adId: 1,
    adTitle: "Ad",
    reporterName: "Reporter",
    reason: "OTHER",
    status: "PENDING",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createUser(overrides: Partial<AdminUser>): AdminUser {
  return {
    userId: 1,
    fullName: "User",
    phone: "99112233",
    role: "USER",
    status: "ACTIVE",
    adCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}
