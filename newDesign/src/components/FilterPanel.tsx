import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, LOCATIONS } from "../data/mock";

export interface Filters {
  category: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  sortBy: "newest" | "oldest" | "price_asc" | "price_desc";
}

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  resultCount: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Шинэ эхэнд" },
  { value: "oldest", label: "Хуучин эхэнд" },
  { value: "price_asc", label: "Үнэ өсөхөөр" },
  { value: "price_desc", label: "Үнэ буурахаар" },
] as const;

export default function FilterPanel({ filters, onFiltersChange, resultCount }: FilterPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount = [
    filters.category,
    filters.location !== "Улаанбаатар" ? filters.location : "",
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  function clearAll() {
    onFiltersChange({ category: "", location: "Улаанбаатар", minPrice: "", maxPrice: "", sortBy: "newest" });
  }

  function update(partial: Partial<Filters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  const panelContent = (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-display)" }}>
          Эрэмбэлэх
        </label>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 py-1 cursor-pointer">
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={filters.sortBy === opt.value}
                onChange={() => update({ sortBy: opt.value })}
                className="w-3.5 h-3.5"
                style={{ accentColor: "var(--primary)" }}
              />
              <span className="text-sm" style={{ color: "var(--foreground)" }}>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-display)" }}>
          Ангилал
        </label>
        <div className="space-y-1">
          <label className="flex items-center gap-2.5 py-1 cursor-pointer">
            <input
              type="radio"
              name="cat"
              value=""
              checked={!filters.category}
              onChange={() => update({ category: "" })}
              className="w-3.5 h-3.5"
              style={{ accentColor: "var(--primary)" }}
            />
            <span className="text-sm" style={{ color: "var(--foreground)" }}>Бүгд</span>
          </label>
          {CATEGORIES.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2.5 py-1 cursor-pointer">
              <input
                type="radio"
                name="cat"
                value={cat.id}
                checked={filters.category === cat.id}
                onChange={() => update({ category: cat.id })}
                className="w-3.5 h-3.5"
                style={{ accentColor: "var(--primary)" }}
              />
              <span className="text-sm" style={{ color: "var(--foreground)" }}>{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-display)" }}>
          Байршил
        </label>
        <select
          value={filters.location}
          onChange={(e) => update({ location: e.target.value })}
          className="w-full h-9 px-2 text-sm rounded-md border outline-none"
          style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
        >
          {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-display)" }}>
          Үнийн дүн (₮)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Доод"
            value={filters.minPrice}
            onChange={(e) => update({ minPrice: e.target.value })}
            className="flex-1 h-9 px-2 text-sm rounded-md border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
          />
          <span style={{ color: "var(--muted-foreground)" }}>—</span>
          <input
            type="number"
            placeholder="Дээд"
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: e.target.value })}
            className="flex-1 h-9 px-2 text-sm rounded-md border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
          />
        </div>
      </div>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full h-9 rounded-md text-sm font-medium border transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--muted)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          Шүүлтүүр арилгах ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block w-56 shrink-0"
        aria-label="Шүүлтүүр"
      >
        <div
          className="rounded-lg p-4 sticky top-20"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              Шүүлтүүр
            </h3>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs" style={{ color: "var(--primary)" }}>
                Арилгах
              </button>
            )}
          </div>
          {panelContent}
        </div>
      </aside>

      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium border"
            style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
          >
            <SlidersHorizontal size={15} />
            Шүүлтүүр
            {activeCount > 0 && (
              <span
                className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: "var(--primary)", color: "white" }}
              >
                {activeCount}
              </span>
            )}
          </button>

          <select
            value={filters.sortBy}
            onChange={(e) => update({ sortBy: e.target.value as Filters["sortBy"] })}
            className="h-9 px-2 text-sm rounded-md border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
          >
            {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>

          <span className="text-sm ml-auto" style={{ color: "var(--muted-foreground)" }}>
            {resultCount} зар
          </span>
        </div>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.category && (
              <FilterChip
                label={CATEGORIES.find((c) => c.id === filters.category)?.label || filters.category}
                onRemove={() => update({ category: "" })}
              />
            )}
            {filters.location !== "Улаанбаатар" && (
              <FilterChip label={filters.location} onRemove={() => update({ location: "Улаанбаатар" })} />
            )}
            {filters.minPrice && (
              <FilterChip label={`₮${Number(filters.minPrice).toLocaleString()}+`} onRemove={() => update({ minPrice: "" })} />
            )}
            {filters.maxPrice && (
              <FilterChip label={`₮${Number(filters.maxPrice).toLocaleString()} хүртэл`} onRemove={() => update({ maxPrice: "" })} />
            )}
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="relative w-full max-h-[85vh] rounded-t-2xl overflow-y-auto p-5"
            style={{ background: "var(--card)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>Шүүлтүүр</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "var(--muted)" }}
              >
                <X size={16} />
              </button>
            </div>
            {panelContent}
            <button
              onClick={() => setMobileOpen(false)}
              className="w-full mt-5 h-11 rounded-md font-semibold text-white"
              style={{ background: "var(--primary)", fontFamily: "var(--font-display)" }}
            >
              {resultCount} зар харах
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-medium"
      style={{ background: "var(--secondary)", color: "var(--primary)", border: "1px solid var(--primary)" }}
    >
      {label}
      <button onClick={onRemove} aria-label={`${label} шүүлтүүр хасах`}>
        <X size={11} />
      </button>
    </span>
  );
}
