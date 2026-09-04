import React from "react";
import type { Category, Location, OwnerAdvertisement } from "@bozar/shared-types";
import { X } from "lucide-react";

export type EditAdPayload = { title: string; description: string; price?: number; categoryId: number; locationId: number; contactPhone: string };

export function EditAdDialog({ ad, categories, locations, busy, onClose, onSave }: {
  ad: OwnerAdvertisement; categories: Category[]; locations: Location[]; busy: boolean; onClose: () => void; onSave: (payload: EditAdPayload) => Promise<void>;
}) {
  const [error, setError] = React.useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const data = new FormData(event.currentTarget); const priceText = String(data.get("price") ?? "").trim();
    try { await onSave({ title: String(data.get("title") ?? "").trim(), description: String(data.get("description") ?? "").trim(), price: priceText ? Number(priceText) : undefined, categoryId: Number(data.get("categoryId")), locationId: Number(data.get("locationId")), contactPhone: String(data.get("contactPhone") ?? "").trim() }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Зар хадгалахад алдаа гарлаа."); }
  }
  return <div className="detail-backdrop"><form className="detail-panel form-panel" aria-busy={busy} onSubmit={submit}>
    <button className="close-button" type="button" onClick={onClose} disabled={busy}><X size={20} /></button><h2>Зар засах</h2>
    <label>Гарчиг<input name="title" defaultValue={ad.title} minLength={3} maxLength={200} disabled={busy} required /></label>
    <label>Тайлбар<textarea name="description" defaultValue={ad.description} minLength={10} maxLength={5000} disabled={busy} required /></label>
    <label>Үнэ<input name="price" type="number" min="0" defaultValue={ad.price ?? ""} disabled={busy} /></label>
    <label>Ангилал<select name="categoryId" defaultValue={ad.categoryId} disabled={busy} required>{categories.map((item) => <option key={item.categoryId} value={item.categoryId}>{item.name}</option>)}</select></label>
    <label>Байршил<select name="locationId" defaultValue={ad.locationId} disabled={busy} required>{locations.map((item) => <option key={item.locationId} value={item.locationId}>{item.name}</option>)}</select></label>
    <label>Холбоо барих утас<input name="contactPhone" defaultValue={ad.contactPhone} minLength={6} maxLength={20} disabled={busy} required /></label>
    {error && <p className="form-error" role="alert">{error}</p>}<button className="primary-action" type="submit" disabled={busy}>{busy ? "Хадгалж байна…" : "Өөрчлөлт хадгалах"}</button>
  </form></div>;
}
