import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Headset, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, OPEN_STATUSES, errText, listTickets, type Ticket } from "@/lib/tickets";
import { Empty } from "@/components/Bits";
import { TicketRow } from "@/components/TicketRow";

const FILTERS = [{ v: "all", l: "Tümü" }, { v: "open", l: "Açık" }, { v: "closed", l: "Kapalı" }] as const;

export default function Home() {
  return (
    <div className="space-y-14">
      <Hero />
      <section>
        <h2 className="mb-5 text-xl font-bold md:text-2xl">Ne hakkında yardım lazım?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <Link key={c.id} to={`/yeni?kategori=${c.id}`} data-testid={`category-${c.id}`} style={{ animationDelay: `${i * 40}ms` }}
              className="animate-rise group flex items-center gap-4 rounded-2xl border bg-card p-5 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-primary/40">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-6 w-6" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{c.title}</span>
                <span className="block text-sm text-muted-foreground">{c.desc}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>
      <MyTickets />
    </div>
  );
}

function Hero() {
  return (
    <section className="animate-rise relative overflow-hidden rounded-3xl border bg-card p-6 sm:p-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-[0_10px_40px_-10px] shadow-primary/70">
          <Headset className="h-10 w-10" />
        </span>
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Destek Merkezi</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-lg">Bir sorun mu yaşıyorsun ya da bir önerin mi var? Ekibimize yaz, talebinin her adımını buradan takip et.</p>
        </div>
        <Link to="/yeni" data-testid="new-ticket-button" className="btn-primary self-start md:self-center"><Plus className="h-5 w-5" /> Yeni talep</Link>
      </div>
    </section>
  );
}

function MyTickets() {
  const { userId, loading } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["v"]>("all");
  const [items, setItems] = useState<Ticket[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!userId) return;
    listTickets({ userId }).then(setItems).catch((e) => setError(errText(e)));
  }, [userId]);

  const shown = (items ?? []).filter((t) => filter === "all" || (filter === "open") === OPEN_STATUSES.includes(t.status));
  return (
    <section data-testid="my-tickets">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold md:text-2xl">Taleplerim</h2>
        <div className="flex rounded-xl border bg-card p-1">
          {FILTERS.map((f) => (
            <button key={f.v} data-testid={`my-tickets-filter-${f.v}`} onClick={() => setFilter(f.v)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${filter === f.v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f.l}</button>
          ))}
        </div>
      </div>
      {loading ? null : !userId ? (
        <Empty testId="my-tickets-login" text="Taleplerini görmek için AnimeXir hesabınla giriş yap." />
      ) : error ? <Empty testId="my-tickets-error" text={error} /> : !items ? (
        <div className="h-24 animate-pulse rounded-2xl bg-card" />
      ) : shown.length ? (
        <div className="space-y-3">{shown.map((t) => <TicketRow key={t.id} t={t} />)}</div>
      ) : <Empty testId="my-tickets-empty" text="Bu listede talep yok." />}
    </section>
  );
}
