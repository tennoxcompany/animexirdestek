import { STATUSES, type Status } from "@/lib/tickets";

export function Avatar({ url, name, size = 36 }: { url?: string | null; name?: string | null; size?: number }) {
  return url ? (
    <img src={url} alt={name ?? ""} style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover ring-2 ring-border" />
  ) : (
    <div style={{ width: size, height: size }} className="flex shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-white">
      {(name ?? "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

export function StatusBadge({ status, testId }: { status: Status; testId?: string }) {
  const s = STATUSES[status];
  return <span data-testid={testId} className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>;
}

export function Empty({ text, testId }: { text: string; testId?: string }) {
  return <div data-testid={testId} className="rounded-2xl border border-dashed bg-card/40 px-6 py-14 text-center text-sm text-muted-foreground">{text}</div>;
}
