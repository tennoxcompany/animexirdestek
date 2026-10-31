import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, createTicket, errText, type CategoryId } from "@/lib/tickets";

export default function NewTicket() {
  const { userId, loading } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const initial = CATEGORIES.some((c) => c.id === params.get("kategori")) ? (params.get("kategori") as CategoryId) : "hesap";
  const [category, setCategory] = useState<CategoryId>(initial);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!loading && !userId) nav(`/giris?geri=${encodeURIComponent(`/yeni?kategori=${initial}`)}`); }, [loading, userId, nav, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 3) return setError("Konu en az 3 karakter olmalı.");
    if (body.trim().length < 10) return setError("Açıklama en az 10 karakter olmalı.");
    setBusy(true); setError("");
    try {
      nav(`/talep/${await createTicket(userId!, { category, subject: subject.trim(), body: body.trim() })}`);
    } catch (err) { setError(errText(err)); setBusy(false); }
  };

  return (
    <div className="animate-rise mx-auto max-w-3xl">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Destek Merkezi</Link>
      <h1 className="text-3xl font-extrabold sm:text-4xl">Yeni talep</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sorunu ne kadar detaylı anlatırsan o kadar hızlı çözeriz.</p>
      <form onSubmit={submit} className="mt-8 space-y-6 rounded-3xl border bg-card p-5 sm:p-8">
        <div>
          <p className="mb-3 text-sm font-semibold">Kategori</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <button type="button" key={c.id} data-testid={`new-category-${c.id}`} onClick={() => setCategory(c.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${category === c.id ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                <c.icon className="h-4 w-4 shrink-0" /> {c.title}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Konu</span>
          <input data-testid="new-subject" className="field" maxLength={120} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Örn. Naruto 120. bölüm açılmıyor" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Açıklama</span>
          <textarea data-testid="new-body" className="field min-h-44 resize-y" maxLength={4000} value={body} onChange={(e) => setBody(e.target.value)}
            placeholder="Ne oldu, ne zaman oldu, hangi cihazı kullanıyorsun?" />
          <span className="mt-1 block text-right text-xs text-muted-foreground">{body.length}/4000</span>
        </label>
        {error && <p data-testid="new-error" className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">{error}</p>}
        <button data-testid="new-submit" disabled={busy} className="btn-primary w-full sm:w-auto"><Send className="h-4 w-4" /> {busy ? "Gönderiliyor..." : "Talebi gönder"}</button>
      </form>
    </div>
  );
}
