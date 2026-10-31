import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquareQuote } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { STATUSES, categoryOf, errText, fmtDate, getTicket, updateTicket, type Status, type Ticket, type TicketEvent } from "@/lib/tickets";
import { Avatar, Empty, StatusBadge } from "@/components/Bits";

export default function TicketPage() {
  const { id = "" } = useParams();
  const { userId, isStaff, loading } = useAuth();
  const [data, setData] = useState<{ ticket: Ticket | null; events: TicketEvent[] } | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => getTicket(id).then(setData).catch((e) => setError(errText(e))), [id]);
  useEffect(() => { if (userId) load(); }, [userId, load]);

  if (loading) return null;
  if (!userId) return <Empty testId="ticket-login" text="Talebi görmek için giriş yap." />;
  if (error) return <Empty testId="ticket-error" text={error} />;
  if (!data) return <div className="h-64 animate-pulse rounded-3xl bg-card" />;
  const t = data.ticket;
  if (!t) return <Empty testId="ticket-not-found" text="Talep bulunamadı ya da görme yetkin yok." />;
  const c = categoryOf(t.category);

  return (
    <div className="animate-rise mx-auto max-w-4xl space-y-6">
      <Link to={isStaff && t.user_id !== userId ? "/yonetim" : "/"} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Geri</Link>
      <section className="rounded-3xl border bg-card p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><c.icon className="h-3.5 w-3.5" /> {c.title}</span>
          <StatusBadge status={t.status} testId="ticket-status" />
          <span className="text-xs text-muted-foreground">#{t.id.slice(0, 8)} · {fmtDate(t.created_at)}</span>
        </div>
        <h1 data-testid="ticket-subject" className="mt-4 break-words text-2xl font-extrabold sm:text-3xl">{t.subject}</h1>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Avatar url={t.profiles?.avatar_url} name={t.profiles?.username} size={28} /> {t.profiles?.username ?? "?"}</div>
        <p data-testid="ticket-body" className="mt-5 whitespace-pre-wrap break-words leading-relaxed text-foreground/90">{t.body}</p>
      </section>
      {t.mod_note && (
        <section data-testid="ticket-mod-note" className="rounded-3xl border border-gold/30 bg-gold/5 p-5 sm:p-6">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-gold"><MessageSquareQuote className="h-4 w-4" /> Moderatör notu</p>
          <p className="whitespace-pre-wrap break-words text-sm">{t.mod_note}</p>
        </section>
      )}
      {isStaff && <StaffPanel t={t} onDone={load} />}
      <Timeline events={data.events} />
    </div>
  );
}

function Timeline({ events }: { events: TicketEvent[] }) {
  return (
    <section className="rounded-3xl border bg-card p-5 sm:p-8">
      <h2 className="mb-6 text-lg font-bold">Talep süreci</h2>
      <ol data-testid="ticket-timeline" className="relative space-y-6 border-l border-white/10 pl-6">
        {events.map((e) => (
          <li key={e.id} className="relative">
            <span className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-card ${STATUSES[e.status].cls.split(" ")[0]}`} />
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={e.status} />
              <span className="text-xs text-muted-foreground">{e.profiles?.username ?? "Sistem"} · {fmtDate(e.created_at)}</span>
            </div>
            {e.note && <p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-secondary px-4 py-3 text-sm">{e.note}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}

function StaffPanel({ t, onDone }: { t: Ticket; onDone: () => void }) {
  const [status, setStatus] = useState<Status>(t.status);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const save = async () => {
    setBusy(true); setMsg(null);
    try { await updateTicket(t.id, status, note); setNote(""); setMsg({ ok: true, text: "Talep güncellendi." }); onDone(); }
    catch (e) { setMsg({ ok: false, text: errText(e) }); }
    setBusy(false);
  };
  return (
    <section data-testid="staff-panel" className="rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-8">
      <h2 className="text-lg font-bold">Değerlendir</h2>
      <p className="mt-1 text-xs text-muted-foreground">Durumu seç, istersen not bırak. Not talep sahibine görünür.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {(Object.keys(STATUSES) as Status[]).map((s) => (
          <button key={s} data-testid={`staff-status-${s}`} onClick={() => setStatus(s)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${status === s ? `${STATUSES[s].cls} border-current` : "text-muted-foreground hover:bg-secondary"}`}>
            {STATUSES[s].label}
          </button>
        ))}
      </div>
      <textarea data-testid="staff-note" className="field mt-4 min-h-28" maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Moderatör notu (isteğe bağlı)" />
      {msg && <p data-testid="staff-message" className={`mt-3 text-sm ${msg.ok ? "text-emerald-300" : "text-primary"}`}>{msg.text}</p>}
      <button data-testid="staff-save" disabled={busy || (status === t.status && !note.trim())} onClick={save} className="btn-primary mt-4">{busy ? "Kaydediliyor..." : "Kaydet"}</button>
    </section>
  );
}
