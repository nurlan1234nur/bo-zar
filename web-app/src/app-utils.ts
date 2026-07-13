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
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:") || imageUrl.startsWith("blob:")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${apiAssetOrigin}${imageUrl}`;
  }

  return imageUrl;
}

export function readAuthResponse<T extends AuthSessionLike>(response: AuthResponseLike<T>): T {
  const data = (response.data ?? response) as T;
  if (!data.token || !data.user) {
    throw new Error("Invalid auth response");
  }
  return { token: data.token, user: data.user } as T;
}
