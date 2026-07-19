import React from "react";
import type { Location, UserProfile } from "@bozar/shared-types";
import type { UpdateProfileRequest } from "@bozar/api-client";

export function ProfileForm({ profile, locations, saving, onSave }: {
  profile: UserProfile;
  locations: Location[];
  saving: boolean;
  onSave: (payload: UpdateProfileRequest) => Promise<void>;
}) {
  const [fullName, setFullName] = React.useState(profile.fullName);
  const [email, setEmail] = React.useState(profile.email ?? "");
  const [locationId, setLocationId] = React.useState(profile.locationId ? String(profile.locationId) : "");
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    setFullName(profile.fullName);
    setEmail(profile.email ?? "");
    setLocationId(profile.locationId ? String(profile.locationId) : "");
    setError("");
    setSaved(false);
  }, [profile]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    const name = fullName.trim();
    const normalizedEmail = email.trim();
    if (name.length < 2 || name.length > 150) {
      setError("Нэр 2–150 тэмдэгттэй байх ёстой.");
      return;
    }
    if (normalizedEmail && !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Зөв email хаяг оруулна уу.");
      return;
    }
    setError("");
    setSaved(false);
    try {
      await onSave({
        fullName: name,
        email: normalizedEmail || null,
        locationId: locationId ? Number(locationId) : null,
      });
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Профайл хадгалах үед алдаа гарлаа.");
    }
  }

  return (
    <form className="account-panel profile-form" onSubmit={submit} aria-label="Профайл засах">
      <div className="account-panel-heading">
        <div><span className="eyebrow">Тохиргоо</span><h2>Профайл</h2></div>
        <span className="profile-readonly">Зөвхөн нэр, email, байршлыг засна</span>
      </div>
      <div className="profile-metadata" aria-label="Бүртгэлийн өөрчлөх боломжгүй мэдээлэл">
        <span><small>Утас</small><strong title={profile.phone}>{profile.phone}</strong></span>
        <span><small>Эрх</small><strong>{profile.role}</strong></span>
        <span><small>Төлөв</small><strong>{profile.status}</strong></span>
      </div>
      <div className="account-form-grid">
        <label>Бүтэн нэр<input value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} maxLength={150} required /></label>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Байршил<select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
          <option value="">Байршил сонгоогүй</option>
          {locations.map((location) => <option key={location.locationId} value={location.locationId}>{location.name}</option>)}
        </select></label>
      </div>
      {error && <p className="account-inline-error" role="alert">{error}</p>}
      {saved && !error && <p className="account-inline-success" role="status">Профайл амжилттай хадгалагдлаа.</p>}
      <button className="primary-wide account-save" type="submit" disabled={saving}>{saving ? "Хадгалж байна…" : "Профайл хадгалах"}</button>
    </form>
  );
}
