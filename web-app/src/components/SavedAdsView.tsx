import type { PublicAdvertisement } from "@bozar/shared-types";
import { ArrowLeft, Heart, Image as ImageIcon, MapPin, RefreshCw } from "lucide-react";
import { formatPrice, hasImage } from "../app-utils";

export function SavedAdsView({ ads, loading, error, resolveImageUrl, onBack, onRetry, onOpen, onRemove }: {
  ads: PublicAdvertisement[];
  loading: boolean;
  error: string;
  resolveImageUrl: (url: string) => string;
  onBack: () => void;
  onRetry: () => void;
  onOpen: (ad: PublicAdvertisement) => void;
  onRemove: (adId: number) => void;
}) {
  return <main className="account-view saved-view">
    <div className="account-toolbar"><div><span className="eyebrow">Хувийн цуглуулга</span><h1>Хадгалсан зарууд</h1></div><button type="button" className="secondary-action" onClick={onBack}><ArrowLeft size={17} /> Зар үзэх</button></div>
    <section className="account-panel saved-panel" aria-busy={loading}>
      {!loading && !error && <div className="account-panel-heading"><div><span className="eyebrow">Favorites</span><h2>{ads.length} хадгалсан зар</h2></div></div>}
      {loading && <div className="owner-loading" role="status"><span className="owner-skeleton" /><span className="owner-skeleton" /><span className="sr-only">Хадгалсан заруудыг ачаалж байна…</span></div>}
      {!loading && error && <div className="owner-state owner-error" role="alert"><strong>Хадгалсан заруудыг ачаалж чадсангүй.</strong><span>{error}</span><button type="button" onClick={onRetry}><RefreshCw size={16} /> Дахин оролдох</button></div>}
      {!loading && !error && ads.length === 0 && <div className="owner-state"><Heart size={30} /><strong>Хадгалсан зар алга.</strong><span>Сонирхсон зарынхаа зүрхэн тэмдгийг дарахад энд хадгалагдана.</span><button type="button" onClick={onBack}>Зар үзэх</button></div>}
      {!loading && !error && ads.length > 0 && <div className="saved-grid">{ads.map((ad) => <article className="card" key={ad.adId} onClick={() => onOpen(ad)}>
        <div className="image-wrap">{hasImage(ad.imageUrl) ? <img src={resolveImageUrl(ad.imageUrl)} alt={ad.title} /> : <div className="card-image-empty"><ImageIcon size={26} /><span>Зураггүй</span></div>}
          <button type="button" className="is-favorite" title="Хадгалснаас хасах" onClick={(event) => { event.stopPropagation(); onRemove(ad.adId); }}><Heart size={18} fill="currentColor" /></button>
        </div>
        <div className="card-body"><span className="meta"><MapPin size={14} /> {ad.locationName}</span><h3>{ad.title}</h3><p>{ad.description}</p><strong>{formatPrice(ad.price)}</strong></div>
      </article>)}</div>}
    </section>
  </main>;
}
