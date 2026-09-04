import { useState, useMemo } from "react";
import Header from "./components/Header";
import HeroSearch from "./components/HeroSearch";
import CategoryGrid from "./components/CategoryGrid";
import AdCard from "./components/AdCard";
import FilterPanel, { Filters } from "./components/FilterPanel";
import AdDetailView from "./components/AdDetailView";
import { MOCK_ADS, CATEGORIES, Ad } from "./data/mock";
import { Search, RefreshCcw, BookmarkX } from "lucide-react";

type View = "home" | "search" | "detail" | "favorites";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Улаанбаатар");
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const [ads, setAds] = useState<Ad[]>(MOCK_ADS);

  const [filters, setFilters] = useState<Filters>({
    category: "",
    location: "Улаанбаатар",
    minPrice: "",
    maxPrice: "",
    sortBy: "newest",
  });

  function toggleFavorite(id: string) {
    setAds((prev) => prev.map((a) => a.id === id ? { ...a, isFavorited: !a.isFavorited } : a));
  }

  function handleSearch(query: string, location?: string) {
    setSearchQuery(query);
    if (location) setSelectedLocation(location);
    setView("search");
    setFilters((f) => ({ ...f, location: location ?? f.location }));
  }

  function handleAdClick(id: string) {
    setSelectedAdId(id);
    setView("detail");
  }

  const favCount = ads.filter((a) => a.isFavorited).length;

  const filteredAds = useMemo(() => {
    let result = ads;

    if (searchQuery && view === "search") {
      result = result.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.category) {
      result = result.filter((a) => a.category === filters.category);
    }

    if (activeCategory && view === "home") {
      result = result.filter((a) => a.category === activeCategory);
    }

    if (filters.minPrice) {
      result = result.filter((a) => a.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter((a) => a.price <= Number(filters.maxPrice));
    }

    switch (filters.sortBy) {
      case "oldest":
        result = [...result].sort((a, b) => a.postedAt.localeCompare(b.postedAt));
        break;
      case "price_asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      default:
        result = [...result].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
    }

    return result;
  }, [ads, searchQuery, filters, activeCategory, view]);

  const favoriteAds = ads.filter((a) => a.isFavorited);

  return (
    <div className="min-h-full flex flex-col" style={{ background: "var(--background)" }}>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(q) => handleSearch(q)}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        favoritesCount={favCount}
        onFavoritesClick={() => setView("favorites")}
        onCreateClick={() => {}}
        currentView={view}
        onLogoClick={() => { setView("home"); setSearchQuery(""); setActiveCategory(""); }}
      />

      <main className="flex-1">
        {/* ── HOME ── */}
        {view === "home" && (
          <>
            <HeroSearch onSearch={handleSearch} />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
              <CategoryGrid
                activeCategory={activeCategory}
                onCategoryChange={(id) => {
                  setActiveCategory(id);
                  if (id) setFilters((f) => ({ ...f, category: id }));
                  else setFilters((f) => ({ ...f, category: "" }));
                }}
              />

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {activeCategory
                      ? CATEGORIES.find((c) => c.id === activeCategory)?.label
                      : "Сүүлд нэмэгдсэн зарууд"}
                  </h2>
                  {activeCategory && (
                    <button
                      onClick={() => { setActiveCategory(""); setFilters((f) => ({ ...f, category: "" })); }}
                      className="text-sm"
                      style={{ color: "var(--primary)" }}
                    >
                      Бүгдийг харах →
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <AdCard key={i} skeleton />)}
                  </div>
                ) : filteredAds.length === 0 ? (
                  <EmptyState
                    icon={<Search size={36} />}
                    title="Зар олдсонгүй"
                    subtitle="Ангиллаа өөрчилж дахин оролдоно уу"
                    action={{ label: "Шүүлтүүр арилгах", onClick: () => { setActiveCategory(""); setFilters((f) => ({ ...f, category: "" })); } }}
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {filteredAds.map((ad) => (
                      <AdCard key={ad.id} ad={ad} onToggleFavorite={toggleFavorite} onClick={handleAdClick} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        {/* ── SEARCH ── */}
        {view === "search" && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
            {/* Search header */}
            <div className="mb-5">
              <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                {searchQuery ? `"${searchQuery}" хайлтын үр дүн` : "Бүх зарууд"}
              </h1>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {filteredAds.length} зар олдлоо
              </p>
            </div>

            <div className="flex gap-6 items-start">
              <FilterPanel filters={filters} onFiltersChange={setFilters} resultCount={filteredAds.length} />

              <div className="flex-1 min-w-0">
                {/* Desktop sort + count */}
                <div className="hidden lg:flex items-center justify-between mb-4">
                  <div className="flex flex-wrap gap-2">
                    {filters.category && (
                      <span
                        className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-medium"
                        style={{ background: "var(--secondary)", color: "var(--primary)", border: "1px solid var(--primary)" }}
                      >
                        {CATEGORIES.find((c) => c.id === filters.category)?.label}
                        <button onClick={() => setFilters((f) => ({ ...f, category: "" }))} aria-label="Ангилал арилгах">✕</button>
                      </span>
                    )}
                  </div>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as Filters["sortBy"] }))}
                    className="h-9 px-2 text-sm rounded-md border outline-none"
                    style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                  >
                    <option value="newest">Шинэ эхэнд</option>
                    <option value="oldest">Хуучин эхэнд</option>
                    <option value="price_asc">Үнэ өсөхөөр</option>
                    <option value="price_desc">Үнэ буурахаар</option>
                  </select>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => <AdCard key={i} skeleton />)}
                  </div>
                ) : filteredAds.length === 0 ? (
                  <EmptyState
                    icon={<Search size={36} />}
                    title="Хайлтад тохирох зар олдсонгүй"
                    subtitle="Түлхүүр үгээ өөрчилж эсвэл шүүлтүүрийг арилгана уу"
                    action={{ label: "Шүүлтүүр арилгах", onClick: () => setFilters({ category: "", location: "Улаанбаатар", minPrice: "", maxPrice: "", sortBy: "newest" }) }}
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredAds.map((ad) => (
                      <AdCard key={ad.id} ad={ad} onToggleFavorite={toggleFavorite} onClick={handleAdClick} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── DETAIL ── */}
        {view === "detail" && selectedAdId && (
          <AdDetailView
            adId={selectedAdId}
            onBack={() => setView(searchQuery ? "search" : "home")}
            onToggleFavorite={toggleFavorite}
            onAdClick={handleAdClick}
          />
        )}

        {/* ── FAVORITES ── */}
        {view === "favorites" && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                Хадгалсан зарууд
              </h1>
              <button
                onClick={() => setView("home")}
                className="text-sm"
                style={{ color: "var(--primary)" }}
              >
                ← Нүүр хуудас
              </button>
            </div>

            {favoriteAds.length === 0 ? (
              <EmptyState
                icon={<BookmarkX size={40} />}
                title="Хадгалсан зар байхгүй"
                subtitle="Зарны зургийн баруун дээд булан дахь зүрх дарж хадгалаарай"
                action={{ label: "Зар хайх", onClick: () => setView("home") }}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {favoriteAds.map((ad) => (
                  <AdCard key={ad.id} ad={ad} onToggleFavorite={toggleFavorite} onClick={handleAdClick} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="mt-16 py-8 border-t"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-xs"
                style={{ background: "var(--primary)", fontFamily: "var(--font-display)" }}
              >B</div>
              <span className="font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}>BoZar</span>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>· Монголын зарын платформ</span>
            </div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              © 2025 BoZar. Бүх эрх хуулиар хамгаалагдсан.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <div style={{ color: "var(--muted-foreground)" }}>{icon}</div>
      <h3 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h3>
      <p className="text-sm max-w-xs" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-medium transition-colors"
          style={{ background: "var(--primary)", color: "white", fontFamily: "var(--font-display)" }}
        >
          <RefreshCcw size={14} /> {action.label}
        </button>
      )}
    </div>
  );
}
