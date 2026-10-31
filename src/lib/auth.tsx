import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Profile = { id: string; username: string; avatar_url: string | null; badge: string | null };
type Auth = { session: Session | null; userId: string | null; profile: Profile | null; isAdmin: boolean; isStaff: boolean; loading: boolean };

const Ctx = createContext<Auth>({ session: null, userId: null, profile: null, isAdmin: false, isStaff: false, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState({ admin: false, mod: false });
  const [loading, setLoading] = useState(true);

  const load = async (uid?: string) => {
    if (!uid) return setProfile(null), setRoles({ admin: false, mod: false });
    const [{ data: p }, { data: r }, { data: m }] = await Promise.all([
      supabase.from("profiles").select("id, username, avatar_url, badge").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("moderators").select("user_id").eq("user_id", uid).maybeSingle(),
    ]);
    setProfile(p as Profile | null);
    setRoles({ admin: !!r?.some((x) => x.role === "admin"), mod: !!m });
  };

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setTimeout(() => load(s?.user.id), 0); });
    supabase.auth.getSession().then(async ({ data: d }) => { setSession(d.session); await load(d.session?.user.id); setLoading(false); });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;
  return <Ctx.Provider value={{ session, userId, profile, isAdmin: roles.admin, isStaff: roles.admin || roles.mod, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
