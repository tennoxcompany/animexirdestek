import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { categoryOf, fmtDate, type Ticket } from "@/lib/tickets";
import { Avatar, StatusBadge } from "@/components/Bits";

export function TicketRow({ t, showUser }: { t: Ticket; showUser?: boolean }) {
  const c = categoryOf(t.category);
  return (
    <Link to={`/talep/${t.id}`} data-testid={`ticket-row-${t.id}`}
      className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-primary/40">
      {showUser ? <Avatar url={t.profiles?.avatar_url} name={t.profiles?.username} size={40} /> : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{t.subject}</p>
        <p className="truncate text-xs text-muted-foreground">
          {showUser && <b className="text-foreground/80">{t.profiles?.username ?? "?"} · </b>}{c.title} · {fmtDate(t.created_at)}
        </p>
      </div>
      <StatusBadge status={t.status} />
      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
