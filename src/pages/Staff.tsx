import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { STATUSES, errText, listTickets, type Status, type Ticket } from "@/lib/tickets";
import { Empty } from "@/components/Bits";
import { TicketRow } from "@/components/TicketRow";

export default function Staff() {
  const { isStaff, loading, userId } = useAuth();
  const [status, setStatus] = useState<Status | "all">("open");
  const [items, setItems] = useState<Ticket[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isStaff) return;
    setItems(null);
    listTickets({ status }).then(setItems).catch((e) => setError(errText(e)));
  }, [isStaff, status]);

  if (loading) return null;
  if (!userId || !isStaff) return <Empty testId="staff-denied" text="Bu sayfa sadece moderatörler ve yönetici içindir." />;
  return (
    <div className="animate-rise space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Talep Yönetimi</h1>
        <p className="mt-2 text-sm text-muted-foreground">Talepleri oku, değerlendir, durumunu güncelle ve not bırak.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["all", ...Object.keys(STATUSES)] as (Status | "all")[]).map((s) => (
          <button key={s} data-testid={`staff-filter-${s}`} onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${status === s ? "bg-primary text-white" : "bg-card text-muted-foreground hover:text-foreground"}`}>
            {s === "all" ? "Tümü" : STATUSES[s].label}
          </button>
        ))}
      </div>
      {error ? <Empty testId="staff-error" text={error} /> : !items ? <div className="h-32 animate-pulse rounded-2xl bg-card" /> : items.length ? (
        <div data-testid="staff-ticket-list" className="space-y-3">{items.map((t) => <TicketRow key={t.id} t={t} showUser />)}</div>
      ) : <Empty testId="staff-empty" text="Bu durumda talep yok." />}
    </div>
  );
}
