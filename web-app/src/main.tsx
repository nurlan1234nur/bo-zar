import React from "react";
import { createRoot } from "react-dom/client";
import { Bell, Flag, Heart, MapPin, Moon, Phone, Plus, RotateCcw, Search, SlidersHorizontal, Sun, User, X } from "lucide-react";
import { ApiClient, ApiClientError, createAdsApi, createAuthApi, createCatalogApi, createFavoritesApi, createImagesApi, createReportsApi, type UpdateProfileRequest } from "@bozar/api-client";
import { themes, type ThemeName, type ThemeTokens } from "../../packages/design-tokens/src/index";
import { type Category, type Location, type OwnerAdvertisement, type PublicAdvertisement, type UserProfile } from "@bozar/shared-types";
import { formatPrice, getApiErrorMessage, hasImage, parseBrowseFilters, readAuthResponse, resolveImageUrlValue, serializeBrowseFilters, type AdSort, type BrowseFilters } from "./app-utils";
import { AccountView } from "./components/AccountView";
import { EditAdDialog, type EditAdPayload } from "./components/EditAdDialog";
import { SavedAdsView } from "./components/SavedAdsView";
import { NotFoundView } from "./components/NotFoundView";
import "./styles.css";

type AuthSession = {
  token: string;
  user: Pick<UserProfile, "userId" | "fullName" | "phone"> & Partial<Omit<UserProfile, "userId" | "fullName" | "phone">>;
};

type AuthResponse = {
  data?: AuthSession;
  token?: string;
  user?: AuthSession["user"];
};

type SessionIdentity = {
  generation: number;
  token: string;
  userId: number;
};

type CreateAdPayload = {
  title: string;
  description: string;
  price?: number;
  categoryId: number;
  subcategoryId?: number;
  locationId: number;
  contactPhone: string;
};

type PublicSubcategory = {
  subcategoryId: number;
  categoryId: number;
  name: string;
};

const MAX_CREATE_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_CREATE_IMAGE_COUNT = 8;
const SUPPORTED_CREATE_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/webp"]);

function validateCreateImages(files: File[]) {
  if (files.length > MAX_CREATE_IMAGE_COUNT) {
    return [`Нэг зар дээр хамгийн ихдээ 8 зураг оруулах боломжтой. Та ${files.length} зураг сонгосон байна.`];
  }
  const oversized = files.filter((file) => file.size > MAX_CREATE_IMAGE_SIZE);
  if (oversized.length > 0) {
    return oversized.map((file) => `${file.name} файлын хэмжээ ${(file.size / 1024 / 1024).toFixed(1)} MB байна. Нэг зураг 5 MB-аас ихгүй байх ёстой.`);
  }
  const unsupported = files.find((file) => !SUPPORTED_CREATE_IMAGE_TYPES.has(file.type.toLowerCase()));
  if (unsupported) {
    return [`${unsupported.name} формат дэмжигдэхгүй. JPG, PNG эсвэл WEBP зураг сонгоно уу.`];
  }
  return [];
}

const SESSION_STORAGE_KEY = "bozar.web.session";
const THEME_STORAGE_KEY = "bozar.web.theme";

function readStoredSession(): AuthSession | null {
  try {
    const value = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as AuthSession;
    if (!parsed.token || !parsed.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

const initialSession = readStoredSession();
const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
const initialTheme: ThemeName = storedTheme === "dark" ? "dark" : "light";
let authToken: string | undefined = initialSession?.token;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";
const API_ASSET_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin;

const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
  getToken: () => authToken,
});
const authApi = createAuthApi(apiClient);
const adsApi = createAdsApi(apiClient);
const catalogApi = createCatalogApi(apiClient);
const favoritesApi = createFavoritesApi(apiClient);
const imagesApi = createImagesApi(apiClient);
const reportsApi = createReportsApi(apiClient);

function applyThemeVariables(theme: ThemeTokens) {
  const root = document.documentElement.style;
  root.setProperty("--color-background", theme.colors.background);
  root.setProperty("--color-surface", theme.colors.surface);
  root.setProperty("--color-surface-muted", theme.colors.surfaceMuted);
  root.setProperty("--color-surface-tint", theme.colors.surfaceTint);
  root.setProperty("--color-text", theme.colors.text);
  root.setProperty("--color-muted", theme.colors.muted);
  root.setProperty("--color-border", theme.colors.border);
  root.setProperty("--color-border-strong", theme.colors.borderStrong);
  root.setProperty("--color-accent", theme.colors.accent);
  root.setProperty("--color-accent-soft", theme.colors.accentSoft);
  root.setProperty("--color-accent-text", theme.colors.accentText);
  root.setProperty("--color-success", theme.colors.success);
  root.setProperty("--color-success-soft", theme.colors.successSoft);
  root.setProperty("--color-danger", theme.colors.danger);
  root.setProperty("--color-danger-soft", theme.colors.dangerSoft);
  root.setProperty("--radius-sm", `${theme.radius.sm}px`);
  root.setProperty("--radius-md", `${theme.radius.md}px`);
  root.setProperty("--radius-lg", `${theme.radius.lg}px`);
  root.setProperty("--radius-pill", `${theme.radius.pill}px`);
  root.setProperty("--layout-content-max", `${theme.layout.contentMaxWidth}px`);
}

applyThemeVariables(themes[initialTheme]);

function resolveImageUrl(imageUrl: string) {
  return resolveImageUrlValue(imageUrl, API_ASSET_ORIGIN);
}

type AppView = "browse" | "account" | "favorites";
type RouteView = AppView | "notFound";
const viewPaths: Record<AppView, string> = { browse: "/", account: "/account", favorites: "/favorites" };
function viewFromPath(pathname: string): RouteView { return pathname === "/" ? "browse" : pathname === "/account" ? "account" : pathname === "/favorites" ? "favorites" : "notFound"; }
const initialBrowseFilters = parseBrowseFilters(window.location.search);

export function App() {
  const [activeView, setActiveView] = React.useState<RouteView>(() => viewFromPath(window.location.pathname));
  const [ads, setAds] = React.useState<PublicAdvertisement[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [subcategories, setSubcategories] = React.useState<PublicSubcategory[]>([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = React.useState(false);
  const [source, setSource] = React.useState<"api" | "offline">("offline");
  const [selectedAd, setSelectedAd] = React.useState<PublicAdvertisement | null>(null);
  const [favoriteIds, setFavoriteIds] = React.useState<Set<number>>(new Set());
  const [favoriteAds, setFavoriteAds] = React.useState<PublicAdvertisement[]>([]);
  const [favoritesLoading, setFavoritesLoading] = React.useState(false);
  const [favoritesError, setFavoritesError] = React.useState("");
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [sessionReady, setSessionReady] = React.useState(!initialSession);
  const [notice, setNotice] = React.useState("");
  const [showAuth, setShowAuth] = React.useState(false);
  const [showCreate, setShowCreate] = React.useState(false);
  const [themeName, setThemeName] = React.useState<ThemeName>(initialTheme);
  const [keyword, setKeyword] = React.useState(initialBrowseFilters.keyword);
  const [keywordDraft, setKeywordDraft] = React.useState(initialBrowseFilters.keyword);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState(initialBrowseFilters.categoryId);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = React.useState(initialBrowseFilters.subcategoryId);
  const [selectedLocationId, setSelectedLocationId] = React.useState(initialBrowseFilters.locationId);
  const [sort, setSort] = React.useState<AdSort>(initialBrowseFilters.sort);
  const [minPrice, setMinPrice] = React.useState(initialBrowseFilters.minPrice);
  const [maxPrice, setMaxPrice] = React.useState(initialBrowseFilters.maxPrice);
  const [minPriceDraft, setMinPriceDraft] = React.useState(initialBrowseFilters.minPrice);
  const [maxPriceDraft, setMaxPriceDraft] = React.useState(initialBrowseFilters.maxPrice);
  const [filterError, setFilterError] = React.useState("");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [page, setPage] = React.useState(initialBrowseFilters.page);
  const [meta, setMeta] = React.useState({ page: 1, size: 12, total: 0, totalPages: 1 });
  const [loadingAds, setLoadingAds] = React.useState(false);
  const [adsError, setAdsError] = React.useState("");
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [myAds, setMyAds] = React.useState<OwnerAdvertisement[]>([]);
  const [ownerLoading, setOwnerLoading] = React.useState(false);
  const [ownerError, setOwnerError] = React.useState("");
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [editingAd, setEditingAd] = React.useState<OwnerAdvertisement | null>(null);
  const [busyAdId, setBusyAdId] = React.useState<number | null>(null);
  const sessionRef = React.useRef<AuthSession | null>(initialSession);
  const sessionGenerationRef = React.useRef(0);
  const ownerRequestRef = React.useRef<SessionIdentity | null>(null);
  const profileSaveRef = React.useRef<SessionIdentity | null>(null);
  const adsRequestRef = React.useRef(0);

  React.useEffect(() => {
    applyThemeVariables(themes[themeName]);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
  }, [themeName]);

  React.useEffect(() => {
    const handlePopState = () => {
      setActiveView(viewFromPath(window.location.pathname));
      const filters = parseBrowseFilters(window.location.search);
      setKeyword(filters.keyword); setKeywordDraft(filters.keyword); setSelectedCategoryId(filters.categoryId); setSelectedSubcategoryId(filters.subcategoryId); setSelectedLocationId(filters.locationId); setSort(filters.sort); setMinPrice(filters.minPrice); setMaxPrice(filters.maxPrice); setMinPriceDraft(filters.minPrice); setMaxPriceDraft(filters.maxPrice); setFilterError(""); setPage(filters.page);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  React.useEffect(() => {
    if (!sessionReady || session || (activeView !== "account" && activeView !== "favorites")) return;
    setShowAuth(true);
    setActiveView("browse");
    window.history.replaceState(null, "", viewPaths.browse);
  }, [activeView, session, sessionReady]);

  React.useEffect(() => {
    if (activeView !== "browse") return;
    const filters: BrowseFilters = { keyword, categoryId: selectedCategoryId, subcategoryId: selectedSubcategoryId, locationId: selectedLocationId, sort, minPrice, maxPrice, page };
    const query = serializeBrowseFilters(filters);
    const nextUrl = query ? `/?${query}` : "/";
    if (`${window.location.pathname}${window.location.search}` !== nextUrl) window.history.replaceState(null, "", nextUrl);
  }, [activeView, keyword, selectedCategoryId, selectedSubcategoryId, selectedLocationId, sort, minPrice, maxPrice, page]);

  function navigate(view: AppView, replace = false) {
    setActiveView(view);
    const path = viewPaths[view];
    if (window.location.pathname !== path) window.history[replace ? "replaceState" : "pushState"](null, "", path);
  }

  async function loadAds() {
    const requestId = ++adsRequestRef.current;
    setLoadingAds(true);
    setAdsError("");

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", "12");

    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (selectedCategoryId) params.set("categoryId", String(selectedCategoryId));
    if (selectedSubcategoryId) params.set("subcategoryId", String(selectedSubcategoryId));
    if (selectedLocationId) params.set("locationId", String(selectedLocationId));
    if (sort !== "newest") params.set("sort", sort);
    if (minPrice.trim()) params.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());

    try {
      const response = await adsApi.list(`?${params.toString()}`);
      if (requestId !== adsRequestRef.current) return;
      setAds(response.data.items);
      setMeta(response.data.meta);
      setSource("api");
    } catch {
      if (requestId !== adsRequestRef.current) return;
      setSource("offline");
      setAdsError("Зарын мэдээллийг татаж чадсангүй.");
      setNotice("Зарын өгөгдөл татахад алдаа гарлаа");
    } finally {
      if (requestId === adsRequestRef.current) setLoadingAds(false);
    }
  }

  React.useEffect(() => {
    let alive = true;
    Promise.all([catalogApi.categories(), catalogApi.locations()])
      .then(([categoriesResponse, locationsResponse]) => {
        if (!alive) return;
        setCategories(categoriesResponse.data);
        setLocations(locationsResponse.data);
        setSource("api");
      })
      .catch(() => {
        if (!alive) return;
        setCategories([]);
        setLocations([]);
        setSource("offline");
      });

    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    let alive = true;
    const identity = captureSessionIdentity();

    if (!identity) {
      setSessionReady(true);
      return () => {
        alive = false;
      };
    }

    authApi
      .me()
      .then((response) => {
        if (!alive || !isCurrentSession(identity)) return;
        syncProfile(response.data, identity);
        setSessionReady(true);
      })
      .catch(() => {
        if (!alive || !isCurrentSession(identity)) return;
        clearAuthenticatedState(false);
        setNotice("Хадгалсан session хүчингүй болсон байна");
      });

    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    if (!sessionReady || !session || activeView !== "account") return;
    void loadOwnerData();
  }, [activeView, sessionReady, session?.token]);

  React.useEffect(() => {
    let alive = true;
    if (!selectedCategoryId) { setSubcategories([]); setSubcategoriesLoading(false); return undefined; }
    setSubcategoriesLoading(true);
    catalogApi.subcategories(selectedCategoryId).then((response) => {
      if (alive) setSubcategories(response.data.items ?? []);
    }).catch(() => { if (alive) setSubcategories([]); }).finally(() => { if (alive) setSubcategoriesLoading(false); });
    return () => { alive = false; };
  }, [selectedCategoryId]);

  React.useEffect(() => {
    void loadAds();
  }, [keyword, selectedCategoryId, selectedSubcategoryId, selectedLocationId, sort, minPrice, maxPrice, page]);

  React.useEffect(() => {
    if (!sessionReady || !session) {
      setFavoriteIds(new Set());
      setFavoriteAds([]);
      setFavoritesLoading(false);
      setFavoritesError("");
      return;
    }

    const identity = captureSessionIdentity();
    if (!identity) return;

    setFavoritesLoading(true);
    setFavoritesError("");
    favoritesApi
      .list()
      .then((response) => {
        if (isCurrentSession(identity)) {
          setFavoriteAds(response.data);
          setFavoriteIds(new Set(response.data.map((ad) => ad.adId)));
        }
      })
      .catch(() => {
        if (isCurrentSession(identity)) {
          setFavoritesError("Хадгалсан заруудыг татах үед алдаа гарлаа.");
          setNotice("Favorite татахад backend алдаа өглөө");
        }
      })
      .finally(() => { if (isCurrentSession(identity)) setFavoritesLoading(false); });
  }, [session, sessionReady]);

  function requireLogin() {
    if (session) return true;
    setShowAuth(true);
    setNotice("Энэ үйлдэлд нэвтрэх шаардлагатай");
    return false;
  }

  function captureSessionIdentity(): SessionIdentity | null {
    const current = sessionRef.current;
    if (!current) return null;
    return { generation: sessionGenerationRef.current, token: current.token, userId: current.user.userId };
  }

  function isCurrentSession(identity: SessionIdentity) {
    const current = sessionRef.current;
    return Boolean(current && sessionGenerationRef.current === identity.generation && current.token === identity.token && current.user.userId === identity.userId);
  }

  function installSession(nextSession: AuthSession) {
    sessionGenerationRef.current += 1;
    sessionRef.current = nextSession;
    authToken = nextSession.token;
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    ownerRequestRef.current = null;
    profileSaveRef.current = null;
    setOwnerLoading(false);
    setProfileSaving(false);
    setPasswordSaving(false);
    setSessionReady(true);
  }

  async function handleAuth(nextSession: AuthSession) {
    installSession(nextSession);
    setProfile(null);
    setMyAds([]);
    setOwnerError("");
    setShowAuth(false);
    setNotice("Амжилттай нэвтэрлээ");
  }

  function clearAuthenticatedState(showLogoutNotice = true) {
    sessionGenerationRef.current += 1;
    sessionRef.current = null;
    authToken = undefined;
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setProfile(null);
    setMyAds([]);
    setOwnerError("");
    setOwnerLoading(false);
    setProfileSaving(false);
    setPasswordSaving(false);
    ownerRequestRef.current = null;
    profileSaveRef.current = null;
    setFavoriteIds(new Set());
    setFavoriteAds([]);
    setFavoritesError("");
    setFavoritesLoading(false);
    navigate("browse", true);
    setSessionReady(true);
    if (showLogoutNotice) setNotice("Гарлаа");
  }

  function performLogout() {
    clearAuthenticatedState();
    void authApi.logout().catch(() => undefined);
  }

  function syncProfile(nextProfile: UserProfile, identity: SessionIdentity) {
    if (!isCurrentSession(identity)) return false;
    const current = sessionRef.current;
    if (!current) return false;
    const nextSession: AuthSession = { ...current, user: nextProfile };
    sessionRef.current = nextSession;
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setProfile((current) => isCurrentSession(identity) ? nextProfile : current);
    setSession((rendered) => isCurrentSession(identity) ? nextSession : rendered);
    return true;
  }

  async function loadOwnerData() {
    const identity = captureSessionIdentity();
    if (!sessionReady || !identity || ownerRequestRef.current && isCurrentSession(ownerRequestRef.current)) return;
    ownerRequestRef.current = identity;
    setOwnerLoading(true);
    setOwnerError("");
    try {
      const [profileResponse, adsResponse] = await Promise.all([authApi.me(), authApi.myAds()]);
      if (!isCurrentSession(identity) || ownerRequestRef.current !== identity) return;
      syncProfile(profileResponse.data, identity);
      setMyAds(adsResponse.data);
    } catch (error) {
      if (!isCurrentSession(identity) || ownerRequestRef.current !== identity) return;
      if (error instanceof ApiClientError && error.status === 401) {
        clearAuthenticatedState(false);
        setShowAuth(true);
        setNotice("Session дууссан байна. Дахин нэвтэрнэ үү.");
        return;
      }
      setOwnerError(getApiErrorMessage(error, "Профайл болон заруудыг ачаалж чадсангүй."));
    } finally {
      if (isCurrentSession(identity) && ownerRequestRef.current === identity) {
        ownerRequestRef.current = null;
        setOwnerLoading(false);
      }
    }
  }

  async function saveProfile(payload: UpdateProfileRequest) {
    const identity = captureSessionIdentity();
    if (!identity || profileSaveRef.current && isCurrentSession(profileSaveRef.current)) return;
    profileSaveRef.current = identity;
    setProfileSaving(true);
    try {
      const response = await authApi.updateMe(payload);
      if (!isCurrentSession(identity) || profileSaveRef.current !== identity) return;
      syncProfile(response.data, identity);
      setNotice("Профайл хадгалагдлаа");
    } catch (error) {
      if (!isCurrentSession(identity) || profileSaveRef.current !== identity) return;
      throw new Error(getApiErrorMessage(error, "Профайл хадгалах үед алдаа гарлаа."));
    } finally {
      if (isCurrentSession(identity) && profileSaveRef.current === identity) {
        profileSaveRef.current = null;
        setProfileSaving(false);
      }
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const identity = captureSessionIdentity();
    if (!identity || passwordSaving) return;
    setPasswordSaving(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      if (isCurrentSession(identity)) setNotice("Нууц үг амжилттай солигдлоо");
    } catch (error) {
      if (!isCurrentSession(identity)) return;
      const fallback = error instanceof ApiClientError && error.status === 401 ? "Одоогийн нууц үг буруу байна." : "Нууц үг солих үед алдаа гарлаа.";
      throw new Error(getApiErrorMessage(error, fallback));
    } finally {
      if (isCurrentSession(identity)) setPasswordSaving(false);
    }
  }

  function openAccount() {
    if (!session) {
      setShowAuth(true);
      return;
    }
    navigate("account");
  }

  function openFavorites() {
    if (!requireLogin()) return;
    navigate("favorites");
  }

  async function reloadFavorites() {
    const identity = captureSessionIdentity();
    if (!identity) return;
    setFavoritesLoading(true); setFavoritesError("");
    try {
      const response = await favoritesApi.list();
      if (!isCurrentSession(identity)) return;
      setFavoriteAds(response.data);
      setFavoriteIds(new Set(response.data.map((ad) => ad.adId)));
    } catch (error) {
      if (isCurrentSession(identity)) setFavoritesError(getApiErrorMessage(error, "Хадгалсан заруудыг татах үед алдаа гарлаа."));
    } finally {
      if (isCurrentSession(identity)) setFavoritesLoading(false);
    }
  }

  async function updateOwnerAd(payload: EditAdPayload) {
    if (!editingAd) return;
    const adId = editingAd.adId;
    setBusyAdId(adId);
    try {
      const response = await adsApi.update(adId, payload);
      setMyAds((current) => current.map((ad) => ad.adId === adId ? { ...ad, ...response.data } : ad));
      setEditingAd(null);
      setNotice("Зар амжилттай шинэчлэгдлээ");
      void loadAds();
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Зар хадгалах үед алдаа гарлаа."));
    } finally {
      setBusyAdId(null);
    }
  }

  async function changeOwnerAdStatus(ad: OwnerAdvertisement, status: "ACTIVE" | "SOLD" | "INACTIVE") {
    const previous = ad.status;
    setBusyAdId(ad.adId);
    setMyAds((current) => current.map((item) => item.adId === ad.adId ? { ...item, status } : item));
    try {
      await adsApi.updateStatus(ad.adId, status);
      setNotice("Зарын төлөв шинэчлэгдлээ");
      void loadAds();
    } catch (error) {
      setMyAds((current) => current.map((item) => item.adId === ad.adId ? { ...item, status: previous } : item));
      setNotice(getApiErrorMessage(error, "Зарын төлөв шинэчлэх үед алдаа гарлаа."));
    } finally {
      setBusyAdId(null);
    }
  }

  async function deleteOwnerAd(ad: OwnerAdvertisement) {
    if (!window.confirm(`“${ad.title}” зарыг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return;
    setBusyAdId(ad.adId);
    try {
      await adsApi.remove(ad.adId);
      setMyAds((current) => current.map((item) => item.adId === ad.adId ? { ...item, status: "DELETED" } : item));
      setFavoriteIds((current) => { const next = new Set(current); next.delete(ad.adId); return next; });
      setNotice("Зар устгагдлаа");
      void loadAds();
    } catch (error) {
      setNotice(getApiErrorMessage(error, "Зар устгах үед алдаа гарлаа."));
    } finally {
      setBusyAdId(null);
    }
  }

  async function toggleFavorite(adId: number) {
    if (!requireLogin()) return;

    const next = new Set(favoriteIds);
    const isFavorite = next.has(adId);
    if (isFavorite) {
      next.delete(adId);
      setFavoriteAds((current) => current.filter((ad) => ad.adId !== adId));
    } else {
      next.add(adId);
      const matched = ads.find((ad) => ad.adId === adId) ?? (selectedAd?.adId === adId ? selectedAd : undefined);
      if (matched) setFavoriteAds((current) => current.some((ad) => ad.adId === adId) ? current : [matched, ...current]);
    }
    setFavoriteIds(next);

    try {
      if (isFavorite) {
        await favoritesApi.remove(adId);
      } else {
        await favoritesApi.add(adId);
      }
      setNotice(isFavorite ? "Favorite устгалаа" : "Favorite нэмлээ");
    } catch {
      setFavoriteIds(favoriteIds);
      void reloadFavorites();
      setNotice("Favorite хадгалах үед backend алдаа өглөө");
    }
  }

  async function reportAd(ad: PublicAdvertisement) {
    if (!requireLogin()) return;

    try {
      await reportsApi.create({ adId: ad.adId, reason: "OTHER", comment: "Web detail view report" });
      setNotice("Report илгээлээ");
    } catch {
      setNotice("Report илгээхэд алдаа гарлаа");
    }
  }

  async function createAd(payload: CreateAdPayload, files: File[]) {
    if (!requireLogin()) return;

    try {
      const response = await adsApi.create(payload);
      const data = response.data;
      const createdId = data?.adId ?? Date.now();
      const fallback: PublicAdvertisement = {
        adId: createdId,
        title: payload.title,
        description: payload.description,
        price: payload.price,
        status: "ACTIVE",
        categoryId: payload.categoryId,
        subcategoryId: payload.subcategoryId,
        locationId: payload.locationId,
        locationName: locations.find((location) => location.locationId === payload.locationId)?.name ?? "Байршилгүй",
        sellerName: session?.user.fullName ?? "Хэрэглэгч",
        contactPhone: payload.contactPhone,
        imageUrl: "",
        viewCount: 0,
        createdAt: new Date().toISOString(),
      };
      const nextAd: PublicAdvertisement = { ...fallback, ...data, status: "ACTIVE" };
      if (files.length > 0 && data?.adId) {
        try {
          const uploadResponse = await imagesApi.upload(data.adId, files);
          const uploadedImageUrl = uploadResponse.data?.[0]?.imageUrl;
          if (!uploadedImageUrl) throw new Error("Image upload response did not include an image URL");
          nextAd.imageUrl = uploadedImageUrl;
          setNotice("Зар болон зураг амжилттай нэмэгдлээ");
        } catch (error) {
          nextAd.imageUrl = "";
          setNotice(error instanceof ApiClientError && error.status === 413
            ? "Зар нэмэгдсэн боловч зураг 5 MB-ын хязгаараас хэтэрсэн тул upload хийгдээгүй."
            : "Зар нэмэгдсэн боловч зураг upload амжилтгүй боллоо");
        }
      } else if (files.length === 0) {
        setNotice("Зар амжилттай нэмэгдлээ");
      } else {
        setNotice("Зар нэмэгдсэн боловч зураг upload амжилтгүй боллоо");
      }
      setAds((current) => [nextAd, ...current]);
      setShowCreate(false);
    } catch {
      setNotice("Зар нэмэхэд алдаа гарлаа");
    }
  }

  function applyBrowseFilters(event: React.FormEvent) {
    event.preventDefault();
    const minimum = minPriceDraft ? Number(minPriceDraft) : undefined;
    const maximum = maxPriceDraft ? Number(maxPriceDraft) : undefined;
    if (minimum !== undefined && maximum !== undefined && minimum > maximum) { setFilterError("Доод үнэ дээд үнээс их байж болохгүй."); return; }
    setFilterError(""); setKeyword(keywordDraft.trim()); setMinPrice(minPriceDraft); setMaxPrice(maxPriceDraft); setPage(1);
  }

  function resetBrowseFilters() {
    setKeyword(""); setKeywordDraft(""); setSelectedCategoryId(0); setSelectedSubcategoryId(0); setSelectedLocationId(0); setSort("newest"); setMinPrice(""); setMaxPrice(""); setMinPriceDraft(""); setMaxPriceDraft(""); setFilterError(""); setPage(1);
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => navigate("browse")} aria-label="BoZar home">
          <span className="brand-mark">B</span>
          <span>BoZar</span>
        </button>
        <nav>
          <span>Зарууд</span>
          <span>Ангилал</span>
          <span>Дайвар</span>
        </nav>
        <div className="top-actions">
          <button className="theme-button" type="button" onClick={() => setThemeName((current) => (current === "light" ? "dark" : "light"))} title="Сэдэв">
            {themeName === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {session ? (
            <button className="account-button" type="button" onClick={openAccount} title="Бүртгэл">
              <User size={18} /> <span className="account-button-label" title={session.user.fullName}>{session.user.fullName}</span>
            </button>
          ) : (
            <button className="account-button" type="button" onClick={() => setShowAuth(true)} title="Нэвтрэх">
              <User size={18} />
            </button>
          )}
          <button className="favorites-button" type="button" onClick={openFavorites} title="Хадгалсан зарууд"><Heart size={18} fill={favoriteIds.size ? "currentColor" : "none"} /><span className="favorites-count">{favoriteIds.size}</span></button>
          <button className="notification-button" type="button" title="Мэдэгдэл">
            <Bell size={18} />
          </button>
          <button type="button" className="post-button" onClick={() => (session ? setShowCreate(true) : setShowAuth(true))}>
            <Plus size={18} /> Зар нэмэх
          </button>
        </div>
      </header>

      {activeView === "notFound" ? (
        <NotFoundView onHome={() => navigate("browse")} onBack={() => window.history.back()} />
      ) : activeView === "favorites" && session ? (
        <SavedAdsView ads={favoriteAds} loading={favoritesLoading} error={favoritesError} resolveImageUrl={resolveImageUrl} onBack={() => navigate("browse")} onRetry={() => void reloadFavorites()} onOpen={setSelectedAd} onRemove={(adId) => void toggleFavorite(adId)} />
      ) : activeView === "account" && session && profile ? (
        <AccountView
          profile={profile}
          locations={locations}
          ads={myAds}
          loading={ownerLoading}
          error={ownerError}
          saving={profileSaving}
          passwordSaving={passwordSaving}
          busyAdId={busyAdId}
          resolveImageUrl={resolveImageUrl}
          onBack={() => navigate("browse")}
          onRetry={() => void loadOwnerData()}
          onSaveProfile={saveProfile}
          onChangePassword={changePassword}
          onEditAd={setEditingAd}
          onStatusChange={(ad, status) => void changeOwnerAdStatus(ad, status)}
          onDeleteAd={(ad) => void deleteOwnerAd(ad)}
          onLogout={performLogout}
        />
      ) : activeView === "account" && session ? (
        <main className="account-view account-loading" aria-busy={!ownerError}>
          {ownerError ? <div className="account-panel owner-state owner-error" role="alert">
            <strong>Профайлыг ачаалж чадсангүй.</strong><span>{ownerError}</span>
            <div className="account-error-actions"><button type="button" onClick={() => navigate("browse")}>Зар үзэх</button><button type="button" onClick={() => void loadOwnerData()}>Дахин оролдох</button><button type="button" onClick={performLogout}>Гарах</button></div>
          </div> : <div className="account-loading-card" />}
        </main>
      ) : (
      <main>
        <section className="hero">
          <span className="eyebrow">Маркетплейс</span>
          <h1>Ойр байгаа зар, үйлчилгээ, дайврыг нэг дороос.</h1>
          <span className="data-source">{source === "api" ? "Backend data" : "Offline"}</span>
          <form className="browse-filter-panel" aria-label="Зар хайх, шүүх" onSubmit={applyBrowseFilters}>
            <div className="search"><Search size={20} /><input aria-label="Зар хайх" value={keywordDraft} onChange={(event) => setKeywordDraft(event.target.value)} placeholder="Гарчиг эсвэл тайлбараар хайх…" maxLength={200} /><button type="submit"><Search size={17} /> Хайх</button></div>
            <button className="mobile-filter-toggle" type="button" aria-label="Шүүлтүүр ба эрэмбэ" aria-expanded={filtersOpen} aria-controls="browse-filter-controls" onClick={() => setFiltersOpen((current) => !current)}>
              <SlidersHorizontal size={17} /> Шүүлтүүр ба эрэмбэ
              <span>{filtersOpen ? "−" : "+"}</span>
            </button>
            <div id="browse-filter-controls" className={`browse-controls${filtersOpen ? " is-open" : ""}`}>
              <label>Дэд ангилал<select value={selectedSubcategoryId} disabled={!selectedCategoryId || subcategoriesLoading} onChange={(event) => { setSelectedSubcategoryId(Number(event.target.value)); setPage(1); }}><option value="0">{subcategoriesLoading ? "Ачаалж байна…" : "Бүх дэд ангилал"}</option>{subcategories.map((item) => <option key={item.subcategoryId} value={item.subcategoryId}>{item.name}</option>)}</select></label>
              <label>Байршил<select value={selectedLocationId} onChange={(event) => { setSelectedLocationId(Number(event.target.value)); setPage(1); }}><option value="0">Бүх байршил</option>{locations.map((item) => <option key={item.locationId} value={item.locationId}>{item.name}</option>)}</select></label>
              <label>Доод үнэ<input type="number" min="0" step="1" inputMode="numeric" value={minPriceDraft} onChange={(event) => setMinPriceDraft(event.target.value)} placeholder="0" /></label>
              <label>Дээд үнэ<input type="number" min="0" step="1" inputMode="numeric" value={maxPriceDraft} onChange={(event) => setMaxPriceDraft(event.target.value)} placeholder="Хязгааргүй" /></label>
              <label>Эрэмбэлэх<select value={sort} onChange={(event) => { setSort(event.target.value as AdSort); setPage(1); }}><option value="newest">Шинэ эхэнд</option><option value="oldest">Хуучин эхэнд</option><option value="mostViewed">Их үзсэн</option><option value="priceAsc">Үнэ өсөх</option><option value="priceDesc">Үнэ буурах</option></select></label>
              <div className="filter-actions"><button type="submit"><SlidersHorizontal size={16} /> Шүүлт хэрэглэх</button><button type="button" className="filter-reset" onClick={resetBrowseFilters}><RotateCcw size={16} /> Цэвэрлэх</button></div>
            </div>
            {filterError && <p className="filter-error" role="alert">{filterError}</p>}
          </form>
        </section>

        <section className="categories">
          <button type="button" className={selectedCategoryId === 0 ? "active" : ""} onClick={() => { setSelectedCategoryId(0); setSelectedSubcategoryId(0); setPage(1); }}>
            <span>Бүгд</span>
            <small>{meta.total} зар</small>
          </button>
          {categories.map((category) => (
            <button
              key={category.categoryId}
              type="button"
              className={selectedCategoryId === category.categoryId ? "active" : ""}
              onClick={() => {
                setSelectedCategoryId(category.categoryId);
                setSelectedSubcategoryId(0);
                setPage(1);
              }}
            >
              <span>{category.name}</span>
              <small>{category.count ?? 0} зар</small>
            </button>
          ))}
        </section>

        <section className="content">
          <div className="section-title">
            <h2>Шинэ зарууд</h2>
            <span>{loadingAds ? "Чиглэж байна..." : `${meta.total} зар`}</span>
          </div>
          {loadingAds && ads.length === 0 && <div className="browse-loading" role="status" aria-label="Заруудыг ачаалж байна"><span /><span /><span /></div>}
          {!loadingAds && adsError && <div className="empty-state browse-error" role="alert"><strong>Заруудыг ачаалж чадсангүй.</strong><p>{adsError}</p><button type="button" onClick={() => void loadAds()}>Дахин оролдох</button></div>}
          {!loadingAds && !adsError && ads.length === 0 && <div className="empty-state"><strong>Тохирох зар олдсонгүй.</strong><p>Шүүлтүүрээ өөрчлөх эсвэл цэвэрлээд дахин оролдоно уу.</p><button type="button" onClick={resetBrowseFilters}>Шүүлтүүр цэвэрлэх</button></div>}
          {!adsError && <div className="grid">
            {ads.map((ad) => (
              <article className="card" key={ad.adId} onClick={() => setSelectedAd(ad)}>
                <div className="image-wrap">
                  {hasImage(ad.imageUrl) ? <img src={resolveImageUrl(ad.imageUrl)} alt={ad.title} /> : <div className="card-image-empty">Зураггүй</div>}
                  <button
                    type="button"
                    className={favoriteIds.has(ad.adId) ? "is-favorite" : ""}
                    onClick={(event) => {
                      event.stopPropagation();
                      void toggleFavorite(ad.adId);
                    }}
                    title="Favorite"
                  >
                    <Heart size={18} fill={favoriteIds.has(ad.adId) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="card-body">
                  <span className="meta">
                    <MapPin size={14} /> {ad.locationName}
                  </span>
                  <h3>{ad.title}</h3>
                  <p>{ad.description}</p>
                  <strong>{formatPrice(ad.price)}</strong>
                </div>
              </article>
            ))}
          </div>}
          <div className="pagination">
            <button type="button" disabled={page <= 1 || loadingAds} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Өмнөх
            </button>
            <span>
              {meta.page} / {meta.totalPages}
            </span>
            <button type="button" disabled={page >= meta.totalPages || loadingAds} onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}>
              Дараа
            </button>
          </div>
        </section>
      </main>
      )}

      {selectedAd && (
        <DetailPanel ad={selectedAd} favorite={favoriteIds.has(selectedAd.adId)} onClose={() => setSelectedAd(null)} onFavorite={toggleFavorite} onReport={reportAd} />
      )}

      {showAuth && <AuthDialog onClose={() => setShowAuth(false)} onAuth={handleAuth} />}
      {showCreate && <CreateAdDialog categories={categories} locations={locations} defaultPhone={session?.user.phone ?? ""} initialCategoryId={selectedCategoryId || categories[0]?.categoryId} onClose={() => setShowCreate(false)} onCreate={createAd} />}
      {editingAd && <EditAdDialog ad={editingAd} categories={categories} locations={locations} busy={busyAdId === editingAd.adId} onClose={() => setEditingAd(null)} onSave={updateOwnerAd} />}
      {notice && <Toast message={notice} onDone={() => setNotice("")} />}
    </div>
  );
}

function DetailPanel({
  ad,
  favorite,
  onClose,
  onFavorite,
  onReport,
}: {
  ad: PublicAdvertisement;
  favorite: boolean;
  onClose: () => void;
  onFavorite: (adId: number) => void;
  onReport: (ad: PublicAdvertisement) => void;
}) {
  return (
    <div className="detail-backdrop">
      <aside className="detail-panel">
        <button className="close-button" type="button" onClick={onClose}>
          <X size={20} />
        </button>
        {hasImage(ad.imageUrl) ? <img className="detail-image" src={resolveImageUrl(ad.imageUrl)} alt={ad.title} /> : <div className="detail-image-empty">Зураггүй</div>}
        <div className="detail-body">
          <span className="meta">
            <MapPin size={15} /> {ad.locationName} · {ad.viewCount} үзсэн
          </span>
          <h2>{ad.title}</h2>
          <strong>{formatPrice(ad.price)}</strong>
          <p>{ad.description}</p>

          <div className="seller">
            <div className="avatar">{ad.sellerName.slice(0, 1)}</div>
            <div>
              <strong>{ad.sellerName}</strong>
              <span>{ad.contactPhone}</span>
            </div>
          </div>

          <div className="detail-actions">
            <a href={`tel:${ad.contactPhone}`}>
              <Phone size={18} /> Залгах
            </a>
            <button type="button" onClick={() => onFavorite(ad.adId)}>
              <Heart size={18} fill={favorite ? "currentColor" : "none"} /> Дуртай
            </button>
            <button type="button" onClick={() => onReport(ad)}>
              <Flag size={18} /> Мэдэгдэх
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function AuthDialog({ onClose, onAuth }: { onClose: () => void; onAuth: (session: AuthSession) => void }) {
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response =
        mode === "login"
          ? await authApi.login({ identifier, password })
          : await authApi.register({
              fullName,
              phone,
              email,
              password,
            });
      onAuth(readAuthResponse(response as AuthResponse));
    } catch (error) {
      setError(getApiErrorMessage(error, "Нэвтрэх эсвэл бүртгүүлэх үед алдаа гарлаа"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="detail-backdrop">
      <form className="detail-panel form-panel" onSubmit={submit}>
        <button className="close-button" type="button" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>{mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}</h2>
        <div className="segment">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Нэвтрэх
          </button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            Бүртгүүлэх
          </button>
        </div>

        {mode === "register" && (
          <>
            <label>
              Нэр
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </label>
            <label>
              Утас
              <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </label>
            <label>
              И-мэйл
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
          </>
        )}

        {mode === "login" && (
          <label>
            Утас эсвэл и-мэйл
            <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} required />
          </label>
        )}
        <label>
          Нууц үг
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-wide" type="submit" disabled={busy}>
          {busy ? "Түр хүлээнэ үү" : mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
        </button>
      </form>
    </div>
  );
}

function CreateAdDialog({
  categories,
  locations,
  defaultPhone,
  initialCategoryId,
  onClose,
  onCreate,
}: {
  categories: Category[];
  locations: Location[];
  defaultPhone: string;
  initialCategoryId?: number;
  onClose: () => void;
  onCreate: (payload: CreateAdPayload, files: File[]) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState(initialCategoryId ?? categories[0]?.categoryId ?? 1);
  const [subcategoryId, setSubcategoryId] = React.useState(0);
  const [locationId, setLocationId] = React.useState(locations[0]?.locationId ?? 1);
  const [contactPhone, setContactPhone] = React.useState(defaultPhone);
  const [files, setFiles] = React.useState<File[]>([]);
  const [fileErrors, setFileErrors] = React.useState<string[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = React.useState<PublicSubcategory[]>([]);

  React.useEffect(() => {
    let alive = true;
    catalogApi
      .subcategories(categoryId)
      .then((response) => {
        if (!alive) return;
        setSubcategoryOptions((response.data.items as PublicSubcategory[]) ?? []);
        setSubcategoryId(0);
      })
      .catch(() => {
        if (!alive) return;
        setSubcategoryOptions([]);
        setSubcategoryId(0);
      });

    return () => {
      alive = false;
    };
  }, [categoryId]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (fileErrors.length > 0) return;
    const validationErrors = validateCreateImages(files);
    if (validationErrors.length > 0) {
      setFileErrors(validationErrors);
      return;
    }
    onCreate(
      {
        title,
        description,
        price: price ? Number(price) : undefined,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        locationId,
        contactPhone,
      },
      files,
    );
  }

  function selectFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const validationErrors = validateCreateImages(selected);
    setFileErrors(validationErrors);
    if (validationErrors.length > 0) {
      setFiles([]);
      event.target.value = "";
      return;
    }
    setFiles(selected);
  }

  return (
    <div className="detail-backdrop">
      <form className="detail-panel form-panel" onSubmit={submit}>
        <button className="close-button" type="button" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>Зар нэмэх</h2>
        <label>
          Гарчиг
          <input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} maxLength={120} />
        </label>
        <label>
          Үнэ
          <input inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Тохиролцоно бол хоосон үлдээ" />
        </label>
        <label>
          Тайлбар
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} required minLength={10} rows={5} />
        </label>

        <div>
          <span className="field-title">Ангилал</span>
          <div className="chip-row">
            {categories.map((category) => (
              <button key={category.categoryId} type="button" className={categoryId === category.categoryId ? "active" : ""} onClick={() => setCategoryId(category.categoryId)}>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {subcategoryOptions.length > 0 && (
          <div>
            <span className="field-title">Дэд ангилал</span>
            <div className="chip-row">
              <button type="button" className={subcategoryId === 0 ? "active" : ""} onClick={() => setSubcategoryId(0)}>
                Бүгд
              </button>
              {subcategoryOptions.map((subcategory) => (
                <button
                  key={subcategory.subcategoryId}
                  type="button"
                  className={subcategoryId === subcategory.subcategoryId ? "active" : ""}
                  onClick={() => setSubcategoryId(subcategory.subcategoryId)}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <span className="field-title">Байршил</span>
          <div className="chip-row">
            {locations.map((location) => (
              <button key={location.locationId} type="button" className={locationId === location.locationId ? "active" : ""} onClick={() => setLocationId(location.locationId)}>
                {location.name}
              </button>
            ))}
          </div>
        </div>

        <label>
          Холбоо барих утас
          <input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} required minLength={6} maxLength={20} />
        </label>
        <label>
          Зураг
          <input type="file" accept="image/png,image/jpeg,image/jpg,image/pjpeg,image/webp" multiple onChange={selectFiles} aria-invalid={fileErrors.length > 0} aria-describedby={`create-image-help${fileErrors.length > 0 ? " create-image-error" : ""}`} />
        </label>
        <div id="create-image-help" className="upload-placeholder">{files.length > 0 ? `${files.length} зураг сонгогдсон` : "JPEG, PNG, WEBP · зураг бүр 5 MB хүртэл · нийт 8 хүртэл"}</div>
        {fileErrors.length > 0 && <div id="create-image-error" className="form-error" role="alert">
          {fileErrors.length === 1 ? <p>{fileErrors[0]}</p> : <ul>{fileErrors.map((message) => <li key={message}>{message}</li>)}</ul>}
        </div>}
        <button className="primary-wide" type="submit">
          Нийтлэх
        </button>
      </form>
    </div>
  );
}

export { MAX_CREATE_IMAGE_COUNT, MAX_CREATE_IMAGE_SIZE, validateCreateImages };

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  React.useEffect(() => {
    const id = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return <div className="toast">{message}</div>;
}

const rootElement = document.getElementById("root");
if (rootElement) createRoot(rootElement).render(<App />);
