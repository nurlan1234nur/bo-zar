import React from "react";

export function PasswordForm({ saving, onSave }: { saving: boolean; onSave: (currentPassword: string, newPassword: string) => Promise<void> }) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const submittingRef = React.useRef(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (saving || submittingRef.current) return; setError(""); setSaved(false);
    if (currentPassword.length < 8 || newPassword.length < 8) { setError("Нууц үг хамгийн багадаа 8 тэмдэгттэй байна."); return; }
    if (newPassword.length > 128) { setError("Шинэ нууц үг 128 тэмдэгтээс урт байж болохгүй."); return; }
    if (currentPassword === newPassword) { setError("Шинэ нууц үг одоогийн нууц үгээс өөр байна."); return; }
    if (newPassword !== confirmation) { setError("Шинэ нууц үгийн баталгаажуулалт таарахгүй байна."); return; }
    submittingRef.current = true;
    try { await onSave(currentPassword, newPassword); setCurrentPassword(""); setNewPassword(""); setConfirmation(""); setSaved(true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Нууц үг солих үед алдаа гарлаа."); }
    finally { submittingRef.current = false; }
  }
  return <form className="account-panel password-form" aria-label="Нууц үг солих" aria-busy={saving} onSubmit={submit}>
    <div className="account-panel-heading"><div><span className="eyebrow">Аюулгүй байдал</span><h2>Нууц үг</h2></div><span className="profile-readonly">8–128 тэмдэгт</span></div>
    <div className="account-form-grid password-grid">
      <label>Одоогийн нууц үг<input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} minLength={8} maxLength={128} disabled={saving} required /></label>
      <label>Шинэ нууц үг<input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} maxLength={128} disabled={saving} required /></label>
      <label>Шинэ нууц үг давтах<input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} maxLength={128} disabled={saving} required /></label>
    </div>
    {error && <p className="account-inline-error" role="alert">{error}</p>}{saved && !error && <p className="account-inline-success" role="status">Нууц үг амжилттай солигдлоо.</p>}
    <button className="primary-wide account-save" type="submit" disabled={saving}>{saving ? "Сольж байна…" : "Нууц үг солих"}</button>
  </form>;
}
