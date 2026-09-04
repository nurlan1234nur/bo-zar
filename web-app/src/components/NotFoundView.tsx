import { ArrowLeft, Home } from "lucide-react";

export function NotFoundView({ onHome, onBack }: { onHome: () => void; onBack: () => void }) {
  return <main className="not-found-view">
    <section className="account-panel not-found-card">
      <span className="not-found-code">404</span>
      <span className="eyebrow">Хуудас олдсонгүй</span>
      <h1>Энэ холбоос байхгүй байна.</h1>
      <p>Хаягийг шалгах эсвэл зарын үндсэн хуудас руу буцна уу.</p>
      <div className="not-found-actions"><button type="button" className="primary-wide" onClick={onHome}><Home size={17} /> Нүүр хуудас</button><button type="button" className="secondary-action" onClick={onBack}><ArrowLeft size={17} /> Буцах</button></div>
    </section>
  </main>;
}
