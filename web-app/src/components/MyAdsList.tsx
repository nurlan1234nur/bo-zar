import type { AdvertisementStatus, OwnerAdvertisement } from "@bozar/shared-types";
import React from "react";
import { Image as ImageIcon, MapPin, RefreshCw } from "lucide-react";
import { formatPrice, hasImage } from "../app-utils";

const statusPresentation: Record<AdvertisementStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Идэвхтэй", className: "status-active" },
  SOLD: { label: "Зарагдсан", className: "status-sold" },
  INACTIVE: { label: "Идэвхгүй", className: "status-inactive" },
  EXPIRED: { label: "Хугацаа дууссан", className: "status-expired" },
  HIDDEN: { label: "Нуусан", className: "status-hidden" },
  DELETED: { label: "Устгасан", className: "status-deleted" },
};

function presentStatus(status: unknown) {
  if (typeof status === "string" && Object.prototype.hasOwnProperty.call(statusPresentation, status)) {
    return statusPresentation[status as AdvertisementStatus];
  }
  return { label: "Unknown", className: "status-unknown" };
}

function OwnerAdImage({ imageUrl, title, resolveImageUrl }: {
  imageUrl: string;
  title: string;
  resolveImageUrl: (url: string) => string;
}) {
  const resolvedUrl = hasImage(imageUrl) ? resolveImageUrl(imageUrl) : "";
  const [failedUrl, setFailedUrl] = React.useState<string | null>(null);
  const showImage = Boolean(resolvedUrl) && failedUrl !== resolvedUrl;

  return <div className="owner-ad-image">
    {showImage
      ? <img src={resolvedUrl} alt={title} onError={() => setFailedUrl(resolvedUrl)} />
      : <span className="owner-ad-image-empty" role="img" aria-label="Зураггүй"><ImageIcon size={24} /><span>Зураггүй</span></span>}
  </div>;
}

export function MyAdsList({ ads, loading, error, resolveImageUrl, onRetry }: {
  ads: OwnerAdvertisement[];
  loading: boolean;
  error: string;
  resolveImageUrl: (url: string) => string;
  onRetry: () => void;
}) {
  return (
    <section className="account-panel my-ads-panel" aria-labelledby="my-ads-title" aria-busy={loading}>
      <div className="account-panel-heading">
        <div><span className="eyebrow">Owner workspace</span><h2 id="my-ads-title">Миний зарууд</h2></div>
        {!loading && !error && <span className="my-ads-count">{ads.length} зар</span>}
      </div>
      {loading && <div className="owner-loading" role="status" aria-label="Заруудыг ачаалж байна"><span className="owner-skeleton" /><span className="owner-skeleton" /><span className="owner-skeleton" /><span className="sr-only">Заруудыг ачаалж байна…</span></div>}
      {!loading && error && <div className="owner-state owner-error" role="alert"><strong>Заруудыг ачаалж чадсангүй.</strong><span>{error}</span><button type="button" onClick={onRetry}><RefreshCw size={16} /> Дахин оролдох</button></div>}
      {!loading && !error && ads.length === 0 && <div className="owner-state"><ImageIcon size={28} /><strong>Одоогоор зар алга.</strong><span>Шинэ зар нийтэлсний дараа энд бүх төлөвтэйгээ харагдана.</span></div>}
      {!loading && !error && ads.length > 0 && <div className="my-ads-list">{ads.map((ad) => {
        const status = presentStatus(ad.status);
        return <article className="owner-ad-card" key={ad.adId}>
          <OwnerAdImage imageUrl={ad.imageUrl} title={ad.title} resolveImageUrl={resolveImageUrl} />
          <div className="owner-ad-copy"><div className="owner-ad-title-row"><h3 title={ad.title}>{ad.title}</h3><span className={`status-badge ${status.className}`} aria-label={`Зарын төлөв: ${status.label}`}>{status.label}</span></div><strong className="owner-ad-price">{formatPrice(ad.price)}</strong><span className="meta owner-ad-location" title={ad.locationName}><MapPin size={14} /> {ad.locationName}</span></div>
        </article>;
      })}</div>}
    </section>
  );
}

export { OwnerAdImage, presentStatus, statusPresentation };
