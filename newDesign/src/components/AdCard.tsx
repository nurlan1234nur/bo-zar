import { useState } from "react";
import { Heart, MapPin, Tag } from "lucide-react";
import { Ad, formatPrice, timeAgo } from "../data/mock";

interface AdCardProps {
  ad: Ad;
  onToggleFavorite: (id: string) => void;
  onClick: (id: string) => void;
  skeleton?: false;
}

interface SkeletonCardProps {
  skeleton: true;
}

type Props = AdCardProps | SkeletonCardProps;

export default function AdCard(props: Props) {
  const [imgError, setImgError] = useState(false);
  const [heartHover, setHeartHover] = useState(false);

  if ("skeleton" in props && props.skeleton) {
    return (
      <div
        className="rounded-lg overflow-hidden animate-pulse"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="aspect-[4/3]" style={{ background: "var(--muted)" }} />
        <div className="p-3 space-y-2">
          <div className="h-4 rounded" style={{ background: "var(--muted)", width: "60%" }} />
          <div className="h-3 rounded" style={{ background: "var(--muted)", width: "90%" }} />
          <div className="h-3 rounded" style={{ background: "var(--muted)", width: "70%" }} />
        </div>
      </div>
    );
  }

  const { ad, onToggleFavorite, onClick } = props as AdCardProps;
  const isSold = ad.status === "sold";
  const isInactive = ad.status === "inactive";

  return (
    <article
      className="group rounded-lg overflow-hidden transition-all cursor-pointer"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-xs)",
        opacity: isInactive ? 0.6 : 1,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-xs)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
      onClick={() => onClick(ad.id)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "var(--muted)" }}>
        {!imgError ? (
          <img
            src={ad.image}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ color: "var(--muted-foreground)" }}>
            <Tag size={28} />
            <span className="text-xs">Зураг байхгүй</span>
          </div>
        )}

        {/* Status overlay */}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
            <span
              className="px-3 py-1 rounded text-sm font-bold text-white rotate-[-10deg]"
              style={{ background: "var(--status-error)", fontFamily: "var(--font-display)", border: "2px solid white" }}
            >
              ЗАРАГДСАН
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {ad.isUrgent && !isSold && (
            <span
              className="px-2 py-0.5 rounded text-xs font-semibold"
              style={{ background: "var(--accent)", color: "var(--accent-foreground)", fontFamily: "var(--font-display)" }}
            >
              Яаралтай
            </span>
          )}
        </div>

        {/* Favorite */}
        <button
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            background: ad.isFavorited ? "var(--primary)" : "rgba(255,255,255,0.9)",
            color: ad.isFavorited ? "white" : heartHover ? "var(--primary)" : "var(--muted-foreground)",
            boxShadow: "var(--shadow-sm)",
          }}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(ad.id); }}
          onMouseEnter={() => setHeartHover(true)}
          onMouseLeave={() => setHeartHover(false)}
          aria-label={ad.isFavorited ? "Хадгалсанаас хасах" : "Хадгалах"}
          aria-pressed={ad.isFavorited}
        >
          <Heart size={14} fill={ad.isFavorited ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <p
          className="font-bold text-base leading-tight mb-1"
          style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}
        >
          {formatPrice(ad.price, ad.currency)}
        </p>
        <p
          className="text-sm leading-snug line-clamp-2 mb-2"
          style={{ color: "var(--foreground)" }}
        >
          {ad.title}
        </p>
        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <MapPin size={11} />
          <span className="truncate">{ad.district}</span>
          <span className="mx-1">·</span>
          <span className="shrink-0">{timeAgo(ad.postedAt)}</span>
        </div>
      </div>
    </article>
  );
}
