import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { MAIN_SITE, supabase } from "@/lib/supabase";

const KEY = "animexir-destek-google";
const GOOGLE_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const sha256Hex = async (s: string) =>
  Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))).map((b) => b.toString(16).padStart(2, "0")).join("");

export default function Login() {
  const { userId } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const back = params.get("geri")?.startsWith("/") ? params.get("geri")! : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { finishGoogle().then((e) => e && setError(e)); }, []);
  useEffect(() => { if (userId) nav(sessionStorage.getItem(`${KEY}-back`) ?? back, { replace: true }); }, [userId, nav, back]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError("E-posta veya şifre hatalı.");
    setBusy(false);
  };

  const google = async () => {
    const nonce = crypto.randomUUID();
    const state = crypto.randomUUID();
    sessionStorage.setItem(KEY, JSON.stringify({ nonce, state }));
    sessionStorage.setItem(`${KEY}-back`, back);
    const q = new URLSearchParams({ client_id: GOOGLE_ID!, redirect_uri: `${location.origin}/giris`, response_type: "id_token", scope: "openid email profile", nonce: await sha256Hex(nonce), state, prompt: "select_account" });
    location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${q}`);
  };

  return (
    <div className="animate-rise mx-auto max-w-md rounded-3xl border bg-card p-6 sm:p-8">
      <h1 className="text-3xl font-extrabold">Giriş yap</h1>
      <p className="mt-2 text-sm text-muted-foreground">AnimeXir hesabınla giriş yap. Hesabın yoksa önce <a className="text-primary hover:underline" href={`${MAIN_SITE}/giris`}>AnimeXir'de kayıt ol</a>.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input data-testid="login-email" className="field" type="email" required autoComplete="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input data-testid="login-password" className="field" type="password" required autoComplete="current-password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p data-testid="login-error" className="text-sm text-primary">{error}</p>}
        <button data-testid="login-submit" disabled={busy} className="btn-primary w-full"><LogIn className="h-4 w-4" /> {busy ? "Giriş yapılıyor..." : "Giriş yap"}</button>
      </form>
      {GOOGLE_ID && <button data-testid="login-google" onClick={google} className="btn-ghost mt-3 w-full">Google ile devam et</button>}
      <a href={`${MAIN_SITE}/sifre-sifirla`} className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground">Şifreni mi unuttun?</a>
    </div>
  );
}

async function finishGoogle() {
  const hash = new URLSearchParams(location.hash.slice(1));
  const token = hash.get("id_token");
  if (!token && !hash.get("error")) return "";
  history.replaceState(null, "", location.pathname + location.search);
  const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as { nonce: string; state: string } | null;
  sessionStorage.removeItem(KEY);
  if (!token || !saved || saved.state !== hash.get("state")) return "Google ile giriş başarısız.";
  const { error } = await supabase.auth.signInWithIdToken({ provider: "google", token, nonce: saved.nonce });
  return error ? "Google ile giriş başarısız." : "";
}
