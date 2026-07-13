import type { AdminActionLog, AdminReport, AdminStats, AdminUser, ApiResponse, Category, Location, PaginatedAds, PublicAdvertisement } from "@bozar/shared-types";

export interface ApiClientOptions {
  baseUrl: string;
  getToken?: () => string | undefined;
}

export class ApiClient {
  constructor(private readonly options: ApiClientOptions) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = this.options.getToken?.();
    const headers = new Headers(init.headers);

    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${this.options.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      let details = "";
      try {
        details = await response.text();
      } catch {
        details = "";
      }
      throw new Error(`API request failed: ${response.status}${details ? ` ${details}` : ""}`);
    }

    return response.json() as Promise<T>;
  }
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export function createAuthApi(client: ApiClient) {
  return {
    register(payload: RegisterRequest) {
      return client.request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    login(payload: LoginRequest) {
      return client.request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    logout() {
      return client.request("/auth/logout", { method: "POST" });
    },
    changePassword(payload: { currentPassword: string; newPassword: string }) {
      return client.request("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    requestPasswordReset(payload: { identifier: string }) {
      return client.request("/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    confirmPasswordReset(payload: { identifier: string; resetToken: string; newPassword: string; requestId?: string }) {
      return client.request("/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    me() {
      return client.request("/users/me");
    },
    updateMe(payload: { fullName?: string; email?: string; locationId?: number; profileImage?: string }) {
      return client.request("/users/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    myAds() {
      return client.request("/users/me/ads");
    },
  };
}

export function createAdsApi(client: ApiClient) {
  return {
    list(query = "") {
      return client.request<ApiResponse<PaginatedAds>>(`/ads${query}`);
    },
    detail(adId: string | number) {
      return client.request<ApiResponse<PublicAdvertisement>>(`/ads/${adId}`);
    },
    create(payload: unknown) {
      return client.request("/ads", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(adId: string | number, payload: unknown) {
      return client.request(`/ads/${adId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    remove(adId: string | number) {
      return client.request(`/ads/${adId}`, { method: "DELETE" });
    },
    updateStatus(adId: string | number, status: PublicAdvertisement["status"] | "INACTIVE" | "EXPIRED" | "HIDDEN" | "DELETED") {
      return client.request(`/ads/${adId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
  };
}

export function createCatalogApi(client: ApiClient) {
  return {
    categories() {
      return client.request<ApiResponse<Category[]>>("/categories");
    },
    subcategories(categoryId: string | number) {
      return client.request<ApiResponse<{ categoryId: number; items: Array<{ subcategoryId: number; categoryId: number; name: string }> }>>(
        `/categories/${categoryId}/subcategories`,
      );
    },
    locations() {
      return client.request<ApiResponse<Location[]>>("/locations");
    },
    childLocations(locationId: string | number) {
      return client.request<ApiResponse<{ locationId: number; items: Location[] }>>(`/locations/${locationId}/children`);
    },
  };
}

export function createAdminApi(client: ApiClient) {
  return {
    stats() {
      return client.request<ApiResponse<AdminStats>>("/admin/dashboard/stats");
    },
    users() {
      return client.request<ApiResponse<AdminUser[]>>("/admin/users");
    },
    reports() {
      return client.request<ApiResponse<AdminReport[]>>("/admin/reports");
    },
    logs() {
      return client.request<ApiResponse<AdminActionLog[]>>("/admin/logs");
    },
    hideAd(adId: string | number) {
      return client.request<ApiResponse<{ adId: number; status: "HIDDEN" }>>(`/admin/ads/${adId}/hide`, { method: "PATCH" });
    },
    blockUser(userId: string | number) {
      return client.request<ApiResponse<{ userId: number; status: "BLOCKED" }>>(`/admin/users/${userId}/block`, { method: "PATCH" });
    },
    suspendUser(userId: string | number) {
      return client.request<ApiResponse<{ userId: number; status: "SUSPENDED" }>>(`/admin/users/${userId}/suspend`, { method: "PATCH" });
    },
    resolveReport(reportId: string | number) {
      return client.request<ApiResponse<{ reportId: number; status: "RESOLVED" }>>(`/admin/reports/${reportId}/resolve`, { method: "PATCH" });
    },
    createCategory(payload: { name: string; icon?: string; description?: string; isActive?: boolean }) {
      return client.request("/admin/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateCategory(categoryId: string | number, payload: { name: string; icon?: string; description?: string; isActive?: boolean }) {
      return client.request(`/admin/categories/${categoryId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    deleteCategory(categoryId: string | number) {
      return client.request(`/admin/categories/${categoryId}`, { method: "DELETE" });
    },
    createSubcategory(categoryId: string | number, payload: { name: string; description?: string; isActive?: boolean }) {
      return client.request(`/admin/categories/${categoryId}/subcategories`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateSubcategory(subcategoryId: string | number, payload: { name: string; description?: string; isActive?: boolean }) {
      return client.request(`/admin/subcategories/${subcategoryId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    deleteSubcategory(subcategoryId: string | number) {
      return client.request(`/admin/subcategories/${subcategoryId}`, { method: "DELETE" });
    },
  };
}

export function createFavoritesApi(client: ApiClient) {
  return {
    list() {
      return client.request<ApiResponse<PublicAdvertisement[]>>("/favorites");
    },
    add(adId: string | number) {
      return client.request<ApiResponse<{ adId: number; favorited: true }>>(`/favorites/${adId}`, { method: "POST" });
    },
    remove(adId: string | number) {
      return client.request<ApiResponse<{ adId: number; favorited: false }>>(`/favorites/${adId}`, { method: "DELETE" });
    },
  };
}

export interface CreateReportRequest {
  adId: number;
  reason: "SPAM" | "FAKE" | "SCAM" | "DUPLICATE" | "INAPPROPRIATE" | "OTHER";
  comment?: string;
}

export function createReportsApi(client: ApiClient) {
  return {
    create(payload: CreateReportRequest) {
      return client.request<
        ApiResponse<{
          reportId: number;
          adId: number;
          reason: CreateReportRequest["reason"];
          comment?: string;
          status: "PENDING";
          createdAt: string;
        }>
      >("/reports", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  };
}

export function createImagesApi(client: ApiClient) {
  return {
    upload(adId: string | number, files: File[] | FormData) {
      const body = files instanceof FormData ? files : new FormData();
      if (Array.isArray(files)) {
        for (const file of files) {
          body.append("files", file);
        }
      }
      return client.request(`/ads/${adId}/images`, {
        method: "POST",
        body,
      });
    },
    remove(imageId: string | number) {
      return client.request(`/images/${imageId}`, { method: "DELETE" });
    },
  };
}
