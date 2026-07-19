import type { Location, OwnerAdvertisement, UserProfile } from "@bozar/shared-types";
import type { UpdateProfileRequest } from "@bozar/api-client";
import { ArrowLeft, LogOut } from "lucide-react";
import { MyAdsList } from "./MyAdsList";
import { ProfileForm } from "./ProfileForm";

export function AccountView({ profile, locations, ads, loading, error, saving, resolveImageUrl, onBack, onRetry, onSaveProfile, onLogout }: {
  profile: UserProfile;
  locations: Location[];
  ads: OwnerAdvertisement[];
  loading: boolean;
  error: string;
  saving: boolean;
  resolveImageUrl: (url: string) => string;
  onBack: () => void;
  onRetry: () => void;
  onSaveProfile: (payload: UpdateProfileRequest) => Promise<void>;
  onLogout: () => void;
}) {
  return <main className="account-view">
    <div className="account-toolbar"><div><span className="eyebrow">Хувийн хэсэг</span><h1>Миний бүртгэл</h1></div><div className="account-toolbar-actions"><button type="button" className="secondary-action" onClick={onBack}><ArrowLeft size={17} /> Зар үзэх</button><button type="button" className="secondary-action logout-action" onClick={onLogout}><LogOut size={17} /> Гарах</button></div></div>
    <header className="account-hero"><div className="account-avatar" aria-hidden="true">{profile.fullName.slice(0, 1).toUpperCase()}</div><div className="account-hero-copy"><span className="eyebrow">Бүртгэлтэй хэрэглэгч</span><h2 title={profile.fullName}>{profile.fullName}</h2><p title={profile.locationName ?? "Байршил сонгоогүй"}>{profile.locationName ?? "Байршил сонгоогүй"}</p><div className="account-summary-chips"><span>{profile.phone}</span><span>{profile.role}</span><span>{profile.status}</span></div></div></header>
    <div className="account-layout"><ProfileForm profile={profile} locations={locations} saving={saving} onSave={onSaveProfile} /><MyAdsList ads={ads} loading={loading} error={error} resolveImageUrl={resolveImageUrl} onRetry={onRetry} /></div>
  </main>;
}
