import { AppWindow, BadgeHelp, Clapperboard, Coins, Copyright, Lightbulb, PlayCircle, ShieldAlert, UserCog } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const CATEGORIES = [
  { id: "hesap", title: "Hesap ve giriş", desc: "Giriş yapamama, şifre, e-posta ve hesap ayarları", icon: UserCog },
  { id: "xir", title: "Xir Coin ve Mağaza", desc: "Coin, VIP rozet, tema ve mağaza işlemleri", icon: Coins },
  { id: "oynatma", title: "Oynatma sorunları", desc: "Video açılmıyor, donuyor, ses veya altyazı sorunu", icon: PlayCircle },
  { id: "icerik", title: "İçerik hataları ve istekler", desc: "Yanlış bölüm, eksik içerik veya yeni anime isteği", icon: Clapperboard },
  { id: "uygulama", title: "Uygulamalar", desc: "Telefon ve masaüstü uygulaması sorunları", icon: AppWindow },
  { id: "telif", title: "Telif hakkı", desc: "Telif hakkı bildirimleri ve kaldırma talepleri", icon: Copyright },
  { id: "oneri", title: "Öneri ve geri bildirim", desc: "Siteyi geliştirmek için fikirlerin", icon: Lightbulb },
  { id: "guvenlik", title: "Güvenlik ve kötüye kullanım", desc: "Taciz, uygunsuz içerik, dolandırıcılık bildirimi", icon: ShieldAlert },
  { id: "diger", title: "Diğer", desc: "Yukarıdakilere uymayan her şey", icon: BadgeHelp },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const categoryOf = (id: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

export const STATUSES = {
  open: { label: "Açık", cls: "bg-sky-500/15 text-sky-300" },
  reviewing: { label: "İnceleniyor", cls: "bg-gold/15 text-gold" },
  approved: { label: "Onaylandı", cls: "bg-emerald-500/15 text-emerald-300" },
  rejected: { label: "Reddedildi", cls: "bg-primary/15 text-primary" },
  closed: { label: "Kapandı", cls: "bg-white/10 text-muted-foreground" },
} as const;
export type Status = keyof typeof STATUSES;
export const OPEN_STATUSES: Status[] = ["open", "reviewing"];

type Person = { username: string; avatar_url: string | null } | null;
export type Ticket = {
  id: string; user_id: string; category: string; subject: string; body: string; status: Status;
  mod_note: string | null; created_at: string; updated_at: string; profiles?: Person;
};
export type TicketEvent = { id: string; status: Status; note: string | null; created_at: string; actor_id: string | null; profiles?: Person };

const TICKET_SEL = "*, profiles!support_tickets_user_id_fkey(username, avatar_url)";

export async function listTickets(opts: { userId?: string; status?: Status | "all" }) {
  let q = supabase.from("support_tickets").select(TICKET_SEL).order("created_at", { ascending: false }).limit(200);
  if (opts.userId) q = q.eq("user_id", opts.userId);
  if (opts.status && opts.status !== "all") q = q.eq("status", opts.status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Ticket[];
}

export async function getTicket(id: string) {
  const [{ data: t, error }, { data: ev }] = await Promise.all([
    supabase.from("support_tickets").select(TICKET_SEL).eq("id", id).maybeSingle(),
    supabase.from("support_ticket_events").select("*, profiles(username, avatar_url)").eq("ticket_id", id).order("created_at"),
  ]);
  if (error) throw error;
  return { ticket: t as Ticket | null, events: (ev ?? []) as TicketEvent[] };
}

export async function createTicket(userId: string, v: { category: string; subject: string; body: string }) {
  const { data, error } = await supabase.from("support_tickets").insert({ user_id: userId, ...v }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function updateTicket(id: string, status: Status, note: string) {
  const { error } = await supabase.rpc("update_support_ticket", { _id: id, _status: status, _note: note });
  if (error) throw error;
}

export const errText = (e: unknown) => {
  const m = (e as { message?: string })?.message ?? "";
  if (m.includes("hızlı")) return "Çok hızlı gidiyorsun, biraz bekleyip tekrar dene.";
  if (m.includes("yetki")) return "Bu işlem için yetkin yok.";
  if (m.includes("support_tickets") || m.includes("schema cache")) return "Destek sistemi henüz kurulmadı (veritabanı güncellemesi bekleniyor).";
  return m || "Bir hata oluştu";
};

export const fmtDate = (s: string) => new Date(s).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
