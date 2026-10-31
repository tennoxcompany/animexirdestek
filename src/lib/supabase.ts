import { createClient } from "@supabase/supabase-js";

export const MAIN_SITE = "https://animexir.duckdns.org";

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
