import { useState } from "react";
import { Search, MapPin, TrendingUp } from "lucide-react";
import { LOCATIONS } from "../data/mock";

interface HeroSearchProps {
  onSearch: (query: string, location: string) => void;
}

const TRENDING = ["Toyota Land Cruiser", "iPhone 15", "2 өрөө орон сууц", "MacBook Pro", "Диван"];

export default function HeroSearch({ onSearch }: HeroSearchProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Улаанбаатар");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query, location);
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--primary)" }}
    >
      {/* Geometric accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 50%, rgba(79,115,248,0.4) 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute top-0 right-0 w-72 h-72 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"
        style={{ background: "rgba(245,158,11,0.12)" }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-display)" }}>
            Монголын хамгийн том зарын платформ
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Шинэ зар олохоос
            <br />
            <span style={{ color: "var(--accent)" }}>хэдхэн секунд</span> л хангалттай
          </h1>
          <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.65)" }}>
            800,000+ идэвхтэй зар · Улаанбаатар болон бүх аймгаар
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div
              className="flex flex-1 items-stretch rounded-md overflow-hidden"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              {/* Location */}
              <div className="flex items-center gap-1.5 px-3 shrink-0" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>
                <MapPin size={14} style={{ color: "var(--accent)" }} />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="text-sm bg-transparent text-white outline-none cursor-pointer h-11"
                  style={{ minWidth: "90px" }}
                >
                  {LOCATIONS.map((loc) => <option key={loc} value={loc} style={{ color: "var(--foreground)" }}>{loc}</option>)}
                </select>
              </div>
              {/* Query */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Юу хайж байна вэ?"
                className="flex-1 h-11 px-3 bg-transparent text-white text-sm outline-none placeholder:text-white/50"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-6 rounded-md font-semibold text-sm transition-opacity"
              style={{ background: "var(--accent)", color: "var(--accent-foreground)", fontFamily: "var(--font-display)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              <Search size={16} className="inline mr-1.5" />
              Хайх
            </button>
          </form>

          {/* Trending */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              <TrendingUp size={12} /> Их хайгдаж буй:
            </span>
            {TRENDING.map((term) => (
              <button
                key={term}
                onClick={() => { setQuery(term); onSearch(term, location); }}
                className="text-xs px-2.5 py-1 rounded-full transition-all"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
