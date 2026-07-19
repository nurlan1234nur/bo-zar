import { ApiClientError } from "@bozar/api-client";

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
