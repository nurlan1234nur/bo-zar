import { useState } from "react";
import { ArrowLeft, Heart, Share2, Flag, Phone, MessageCircle, MapPin, Calendar, Tag, ChevronRight } from "lucide-react";
import { Ad, MOCK_ADS, formatPrice, timeAgo } from "../data/mock";
import AdCard from "./AdCard";

interface Props {
  adId: string;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onAdClick: (id: string) => void;
}

export default function AdDetailView({ adId, onBack, onToggleFavorite, onAdClick }: Props) {
  const ad = MOCK_ADS.find((a) => a.id === adId);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [showContact, setShowContact] = useState(false);

  if (!ad) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Tag size={40} style={{ color: "var(--muted-foreground)" }} />
        <p className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>Зар олдсонгүй</p>
        <button onClick={onBack} className="text-sm" style={{ color: "var(--primary)" }}>← Буцах</button>
      </div>
    );
  }

  const related = MOCK_ADS.filter((a) => a.id !== ad.id && a.category === ad.category).slice(0, 4);
  const isSold = ad.status === "sold";

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs mb-4 flex-wrap" style={{ color: "var(--muted-foreground)" }}>
        <button onClick={onBack} className="flex items-center gap-1 transition-colors" style={{ color: "var(--primary)" }}>
          <ArrowLeft size={13} /> Буцах
        </button>
        <ChevronRight size={12} />
        <span>{ad.category}</span>
        <ChevronRight size={12} />
        <span style={{ color: "var(--foreground)" }}>{ad.subcategory}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div>
          {/* Image gallery */}
          <div
            className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3"
            style={{ background: "var(--muted)" }}
          >
            {!imgError ? (
              <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--muted-foreground)" }}>
                <Tag size={48} />
              </div>
            )}
            {isSold && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                <span className="px-4 py-2 rounded text-white font-bold text-lg rotate-[-8deg]"
                  style={{ background: "var(--status-error)", border: "2px solid white", fontFamily: "var(--font-display)" }}>
                  ЗАРАГДСАН
                </span>
              </div>
            )}
          </div>

          {/* Title and price */}
          <div
            className="rounded-lg p-4 mb-4"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-xl font-bold leading-snug flex-1" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                {ad.title}
              </h1>
              <div className="flex gap-1.5 shrink-0">
                <button
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                  aria-label="Хуваалцах"
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={() => onToggleFavorite(ad.id)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors"
                  style={{
                    borderColor: ad.isFavorited ? "var(--primary)" : "var(--border)",
                    background: ad.isFavorited ? "var(--secondary)" : "transparent",
                    color: ad.isFavorited ? "var(--primary)" : "var(--muted-foreground)",
                  }}
                  aria-label={ad.isFavorited ? "Хадгалсанаас хасах" : "Хадгалах"}
                  aria-pressed={ad.isFavorited}
                >
                  <Heart size={16} fill={ad.isFavorited ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
            <p className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}>
              {formatPrice(ad.price, ad.currency)}
            </p>
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-1.5"><MapPin size={14} />{ad.district}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} />{timeAgo(ad.postedAt)}</span>
              <span className="flex items-center gap-1.5"><Tag size={14} />{ad.subcategory}</span>
            </div>
          </div>

          {/* Description */}
          <div
            className="rounded-lg p-4 mb-4"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h2 className="font-semibold text-sm mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Тайлбар
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
              Энэхүү бараа маш сайн төлөвт байгаа бөгөөд бид урт хугацаанд эзэмшиж байсан. Техникийн үзлэг тогтмол хийгдэж, бүх хэсэг нь ажиллах боломжтой байгаа. Үзэж танилцахыг урьж байна.
              <br /><br />
              Зарлагдсан үнэ нь эцсийн бөгөөд тохиролцоогүй болно. Холбогдохын тулд дор байгаа товчийг дарна уу.
            </p>
          </div>

          {/* Report */}
          <button
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--status-error)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"; }}
          >
            <Flag size={14} /> Зар мэдээлэх
          </button>
        </div>

        {/* Right column — seller + contact */}
        <div>
          <div
            className="rounded-lg p-4 mb-4 sticky top-20"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: "var(--primary)", fontFamily: "var(--font-display)" }}
              >
                Б
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                  Батсайхан Д.
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Гишүүн 2023 оноос</p>
              </div>
            </div>

            {isSold ? (
              <div
                className="rounded-md py-3 px-4 text-center text-sm font-semibold"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontFamily: "var(--font-display)" }}
              >
                Энэ бараа зарагдсан байна
              </div>
            ) : (
              <div className="space-y-2.5">
                {showContact ? (
                  <div
                    className="rounded-md py-3 px-4 text-center"
                    style={{ background: "var(--secondary)", border: "1px solid var(--primary)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Утасны дугаар</p>
                    <p className="font-bold text-lg" style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}>
                      9911 2233
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full h-11 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-opacity"
                    style={{ background: "var(--primary)", color: "white", fontFamily: "var(--font-display)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                  >
                    <Phone size={16} /> Утасны дугаар харах
                  </button>
                )}
                <button
                  className="w-full h-11 rounded-md font-semibold text-sm flex items-center justify-center gap-2 border transition-colors"
                  style={{ borderColor: "var(--primary)", color: "var(--primary)", fontFamily: "var(--font-display)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--secondary)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <MessageCircle size={16} /> Мессеж илгээх
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related ads */}
      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Ижил төрлийн зарууд
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {related.map((a) => (
              <AdCard key={a.id} ad={a} onToggleFavorite={onToggleFavorite} onClick={onAdClick} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
