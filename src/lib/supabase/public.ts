import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** true si hay credenciales configuradas. */
export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Cliente anonimo SIN cookies, para lecturas publicas cacheadas.
 *
 * Es deliberado que no lea cookies(): esa llamada ata el render al request y
 * volveria dinamica toda la home. Este cliente se usa solo dentro de
 * unstable_cache, donde no hay request scope.
 */
export function createPublicClient() {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copiá .env.example a .env.local.",
    );
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
