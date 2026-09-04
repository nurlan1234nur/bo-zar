import { useState } from "react";
import { Search, MapPin, Heart, User, Plus, Menu, X, ChevronDown } from "lucide-react";
import { LOCATIONS } from "../data/mock";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  favoritesCount: number;
  onFavoritesClick: () => void;
  onCreateClick: () => void;
  currentView: string;
  onLogoClick: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedLocation,
  onLocationChange,
  favoritesCount,
  onFavoritesClick,
  onCreateClick,
  onLogoClick,
}: HeaderProps) {
  const [locationOpen, setLocationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearchChange(inputValue);
    onSearchSubmit(inputValue);
  }

  return (
    <header
      style={{ borderBottom: "1px solid var(--border)", background: "var(--card)", boxShadow: "var(--shadow-xs)" }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 h-16">
          {/* Logo */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-1.5 shrink-0 focus-visible:rounded"
            aria-label="BoZar нүүр хуудас"
          >
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "var(--primary)", fontFamily: "var(--font-display)" }}
            >
              B
            </div>
            <span
              className="text-lg font-bold tracking-tight hidden sm:block"
              style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}
            >
              BoZar
            </span>
          </button>

          {/* Search bar */}
          <form onSubmit={handleSubmit} className="flex flex-1 min-w-0 items-stretch gap-0 max-w-2xl">
            {/* Location selector */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setLocationOpen(!locationOpen)}
                className="flex items-center gap-1.5 h-10 px-3 text-sm font-medium border-y border-l rounded-l-md whitespace-nowrap transition-colors"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--muted)",
                  color: "var(--foreground)",
                }}
              >
                <MapPin size={14} style={{ color: "var(--primary)" }} />
                <span className="max-w-[100px] truncate">{selectedLocation}</span>
                <ChevronDown size={12} style={{ color: "var(--muted-foreground)" }} />
              </button>
              {locationOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-48 rounded-md py-1 z-10"
                  style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
                >
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => { onLocationChange(loc); setLocationOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm transition-colors"
                      style={{
                        color: loc === selectedLocation ? "var(--primary)" : "var(--foreground)",
                        background: loc === selectedLocation ? "var(--secondary)" : "transparent",
                        fontWeight: loc === selectedLocation ? 500 : 400,
                      }}
                      onMouseEnter={(e) => { if (loc !== selectedLocation) (e.currentTarget as HTMLElement).style.background = "var(--muted)"; }}
                      onMouseLeave={(e) => { if (loc !== selectedLocation) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-1 min-w-0 border rounded-md sm:rounded-l-none sm:border-l-0"
              style={{ borderColor: "var(--border)" }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Барааны нэр, загвар хайх..."
                className="flex-1 min-w-0 h-10 px-3 text-sm bg-transparent outline-none"
                style={{ color: "var(--foreground)" }}
                aria-label="Хайлт"
              />
              <button
                type="submit"
                className="flex items-center justify-center w-10 h-10 rounded-r-md shrink-0 transition-colors"
                style={{ background: "var(--primary)", color: "white" }}
                aria-label="Хайх"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={onFavoritesClick}
              className="relative flex items-center justify-center w-9 h-9 rounded-md transition-colors"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--muted)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              aria-label={`Хадгалсан зарууд — ${favoritesCount}`}
            >
              <Heart size={20} />
              {favoritesCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
                >
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-md transition-colors"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--muted)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              aria-label="Бүртгэл"
            >
              <User size={20} />
            </button>

            <button
              onClick={onCreateClick}
              className="flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-semibold transition-all"
              style={{ background: "var(--accent)", color: "var(--accent-foreground)", fontFamily: "var(--font-display)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Зар нийтлэх</span>
              <span className="sm:hidden">Зар</span>
            </button>

            <button
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Цэс"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden px-4 pb-4"
          style={{ borderTop: "1px solid var(--border)", background: "var(--card)" }}
        >
          <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
            <select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="h-10 px-2 text-sm rounded-md border"
              style={{ borderColor: "var(--border)", background: "var(--muted)", color: "var(--foreground)" }}
            >
              {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Хайлт..."
              className="flex-1 h-10 px-3 text-sm rounded-md border outline-none"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-md flex items-center justify-center"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <Search size={16} />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
