import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string | null;
}

/**
 * Autorizacion real del panel.
 *
 * Se llama en admin/layout.tsx Y al principio de CADA Server Action.
 * El proxy solo refresca la sesion: puede ser evadido y no protege una accion
 * invocada por POST directo. La RLS es la ultima linea, pero fallar temprano
 * da mejores errores. En el sitio viejo el "guard" era `if (user)` en el
 * cliente, asi que cualquier cliente registrado entraba al panel.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data, error } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (error || !data) redirect("/admin/login?error=forbidden");

  return { id: user.id, email: user.email ?? null };
}

/** Variante para Server Actions: devuelve error en vez de redirigir. */
export async function assertAdmin(): Promise<AdminUser | null> {
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? { id: user.id, email: user.email ?? null } : null;
}
