import { Car, Building2, Smartphone, Sofa, Shirt, Briefcase, Trophy, Baby } from "lucide-react";
import { CATEGORIES } from "../data/mock";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Car, Building2, Smartphone, Sofa, Shirt, Briefcase, Trophy, Baby,
};

interface CategoryGridProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export default function CategoryGrid({ activeCategory, onCategoryChange }: CategoryGridProps) {
  return (
    <section aria-label="Ангилалууд">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          Ангилалууд
        </h2>
        <button
          className="text-sm font-medium transition-colors"
          style={{ color: "var(--primary)" }}
        >
          Бүгдийг үзэх →
        </button>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon];
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(isActive ? "" : cat.id)}
              className="flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-lg transition-all focus-visible:rounded-lg"
              style={{
                background: isActive ? "var(--secondary)" : "var(--card)",
                border: `1px solid ${isActive ? "var(--primary)" : "var(--border)"}`,
                color: isActive ? "var(--primary)" : "var(--muted-foreground)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "var(--muted)";
                  (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "var(--card)";
                  (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
                }
              }}
              aria-pressed={isActive}
            >
              {Icon && <Icon size={22} />}
              <span
                className="text-[11px] sm:text-xs font-medium text-center leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {cat.label.split(" ").slice(0, 2).join(" ")}
              </span>
              <span className="text-[10px]" style={{ color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
                {cat.count.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
