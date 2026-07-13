import React from "react";
import { createRoot } from "react-dom/client";
import { Bell, Flag, Heart, MapPin, Moon, Phone, Plus, Search, Sun, User, X } from "lucide-react";
import { ApiClient, createAdsApi, createAuthApi, createCatalogApi, createFavoritesApi, createImagesApi, createReportsApi } from "@bozar/api-client";
import { themes, type ThemeName, type ThemeTokens } from "../../packages/design-tokens/src/index";
import { type Category, type Location, type PublicAdvertisement } from "@bozar/shared-types";
import { formatPrice, getApiErrorMessage, hasImage, readAuthResponse, resolveImageUrlValue } from "./app-utils";
import "./styles.css";

type AuthSession = {
  token: string;
  user: {
    userId: number;
    fullName: string;
    phone: string;
    email?: string;
    role?: string;
  };
};

type AuthResponse = {
  data?: AuthSession;
  token?: string;
  user?: AuthSession["user"];
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
const initialTheme = (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null) ?? "light";
let authToken: string | undefined = initialSession?.token;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";
const API_ASSET_ORIGIN = new URL(API_BASE_URL).origin;

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

function App() {
  const [ads, setAds] = React.useState<PublicAdvertisement[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [subcategories, setSubcategories] = React.useState<PublicSubcategory[]>([]);
  const [source, setSource] = React.useState<"api" | "offline">("offline");
  const [selectedAd, setSelectedAd] = React.useState<PublicAdvertisement | null>(null);
  const [favoriteIds, setFavoriteIds] = React.useState<Set<number>>(new Set());
  const [session, setSession] = React.useState<AuthSession | null>(initialSession);
  const [sessionReady, setSessionReady] = React.useState(!initialSession);
  const [notice, setNotice] = React.useState("");
  const [showAuth, setShowAuth] = React.useState(false);
  const [showCreate, setShowCreate] = React.useState(false);
  const [themeName, setThemeName] = React.useState<ThemeName>(initialTheme);
  const [keyword, setKeyword] = React.useState("");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number>(0);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = React.useState<number>(0);
  const [selectedLocationId, setSelectedLocationId] = React.useState<number>(0);
  const [sort, setSort] = React.useState<"newest" | "oldest" | "mostViewed" | "priceAsc" | "priceDesc">("newest");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState({ page: 1, size: 12, total: 0, totalPages: 1 });
  const [loadingAds, setLoadingAds] = React.useState(false);

  React.useEffect(() => {
    applyThemeVariables(themes[themeName]);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
  }, [themeName]);

  async function loadAds() {
    setLoadingAds(true);

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
      setAds(response.data.items);
      setMeta(response.data.meta);
      setSource("api");
    } catch {
      setSource("offline");
      setNotice("Зарын өгөгдөл татахад алдаа гарлаа");
    } finally {
      setLoadingAds(false);
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

    if (!initialSession) {
      setSessionReady(true);
      return () => {
        alive = false;
      };
    }

    authApi
      .me()
      .then(() => {
        if (!alive) return;
        setSessionReady(true);
      })
      .catch(() => {
        if (!alive) return;
        authToken = undefined;
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        setSession(null);
        setFavoriteIds(new Set());
        setNotice("Хадгалсан session хүчингүй болсон байна");
        setSessionReady(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    let alive = true;

    if (!selectedCategoryId) {
      setSubcategories([]);
      return undefined;
    }

    catalogApi
      .subcategories(selectedCategoryId)
      .then((response) => {
        if (!alive) return;
        setSubcategories((response.data.items as PublicSubcategory[]) ?? []);
      })
      .catch(() => {
        if (!alive) return;
        setSubcategories([]);
      });

    return () => {
      alive = false;
    };
  }, [selectedCategoryId]);

  React.useEffect(() => {
    void loadAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, selectedCategoryId, selectedSubcategoryId, selectedLocationId, sort, minPrice, maxPrice, page]);

  React.useEffect(() => {
    if (!sessionReady || !session) {
      setFavoriteIds(new Set());
      return;
    }

    favoritesApi
      .list()
      .then((response) => setFavoriteIds(new Set(response.data.map((ad) => ad.adId))))
      .catch(() => setNotice("Favorite татахад backend алдаа өглөө"));
  }, [session, sessionReady]);

  function requireLogin() {
    if (session) return true;
    setShowAuth(true);
    setNotice("Энэ үйлдэлд нэвтрэх шаардлагатай");
    return false;
  }

  async function handleAuth(nextSession: AuthSession) {
    authToken = nextSession.token;
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    setShowAuth(false);
    setNotice("Амжилттай нэвтэрлээ");
  }

  function logout() {
    authToken = undefined;
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setFavoriteIds(new Set());
    setNotice("Гарлаа");
  }

  async function toggleFavorite(adId: number) {
    if (!requireLogin()) return;

    const next = new Set(favoriteIds);
    const isFavorite = next.has(adId);
    if (isFavorite) {
      next.delete(adId);
    } else {
      next.add(adId);
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
      const data = (response as { data?: Partial<PublicAdvertisement> & { adId?: number } }).data;
      const createdId = data?.adId ?? Date.now();
      const selectedImagePreview = files[0] ? URL.createObjectURL(files[0]) : undefined;
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
        imageUrl: selectedImagePreview ?? "",
        viewCount: 0,
        createdAt: new Date().toISOString(),
      };
      const nextAd: PublicAdvertisement = { ...fallback, ...data, status: data?.status === "SOLD" ? "SOLD" : "ACTIVE" };
      if (files.length > 0 && data?.adId) {
        try {
          const uploadResponse = (await imagesApi.upload(data.adId, files)) as { data?: Array<{ imageUrl: string }> };
          const uploadedImageUrl = uploadResponse.data?.[0]?.imageUrl;
          if (uploadedImageUrl) {
            nextAd.imageUrl = uploadedImageUrl;
          }
        } catch {
          // Keep the created ad even if the image upload fails.
        }
      }
      setAds((current) => [nextAd, ...current]);
      setShowCreate(false);
      setNotice("Зар нэмэгдлээ");
    } catch {
      setNotice("Зар нэмэхэд алдаа гарлаа");
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <strong>BO Zar</strong>
        <nav>
          <span>Зарууд</span>
          <span>Ангилал</span>
          <span>Дайвар</span>
        </nav>
        <div className="top-actions">
          <button type="button" onClick={() => setThemeName((current) => (current === "light" ? "dark" : "light"))} title="Сэдэв">
            {themeName === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {session ? (
            <button type="button" onClick={logout} title="Гарах">
              <User size={18} /> {session.user.fullName}
            </button>
          ) : (
            <button type="button" onClick={() => setShowAuth(true)} title="Нэвтрэх">
              <User size={18} />
            </button>
          )}
          <button type="button" title="Мэдэгдэл">
            <Bell size={18} />
          </button>
          <button type="button" className="post-button" onClick={() => (session ? setShowCreate(true) : setShowAuth(true))}>
            <Plus size={18} /> Зар нэмэх
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <span className="eyebrow">Маркетплейс</span>
          <h1>Ойр байгаа зар, үйлчилгээ, дайврыг нэг дороос.</h1>
          <span className="data-source">{source === "api" ? "Backend data" : "Offline"}</span>
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
          <div className="grid">
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
          </div>
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

      {selectedAd && (
        <DetailPanel ad={selectedAd} favorite={favoriteIds.has(selectedAd.adId)} onClose={() => setSelectedAd(null)} onFavorite={toggleFavorite} onReport={reportAd} />
      )}

      {showAuth && <AuthDialog onClose={() => setShowAuth(false)} onAuth={handleAuth} />}
      {showCreate && <CreateAdDialog categories={categories} locations={locations} defaultPhone={session?.user.phone ?? ""} initialCategoryId={selectedCategoryId || categories[0]?.categoryId} onClose={() => setShowCreate(false)} onCreate={createAd} />}
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
          <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 8))} />
        </label>
        <div className="upload-placeholder">{files.length > 0 ? `${files.length} зураг сонгогдсон` : "PNG, JPG, WEBP зураг 8 хүртэл сонгоно"}</div>
        <button className="primary-wide" type="submit">
          Нийтлэх
        </button>
      </form>
    </div>
  );
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  React.useEffect(() => {
    const id = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return <div className="toast">{message}</div>;
}

createRoot(document.getElementById("root")!).render(<App />);
