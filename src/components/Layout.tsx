import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { ExternalLink, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { MAIN_SITE, supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Bits";

export function Layout({ children }: { children: ReactNode }) {
  const { userId, profile, isStaff } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/" data-testid="brand-link" className="font-display text-lg font-bold">
            Anime<span className="text-primary">Xir</span> <span className="font-sans text-sm font-semibold text-muted-foreground">Destek</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            {isStaff && (
              <NavLink to="/yonetim" data-testid="nav-staff" className="flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1.5 text-sm font-semibold text-gold hover:bg-gold/20">
                <ShieldCheck className="h-4 w-4" /> <span className="hidden sm:inline">Talep Yönetimi</span>
              </NavLink>
            )}
            <a href={MAIN_SITE} data-testid="nav-main-site" className="hidden items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground sm:flex">
              AnimeXir'e dön <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {userId ? (
              <div className="flex items-center gap-2">
                <Avatar url={profile?.avatar_url} name={profile?.username} size={34} />
                <button data-testid="logout-button" aria-label="Çıkış yap" onClick={() => supabase.auth.signOut()}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/giris" data-testid="nav-login" className="btn-primary py-2!">Giriş Yap</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8">{children}</main>
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">© 2026 AnimeXir & Tennox Company · Destek Merkezi</footer>
    </div>
  );
}
