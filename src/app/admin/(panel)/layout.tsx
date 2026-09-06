import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { SetupNotice } from "@/components/admin/setup-notice";
import { Toaster } from "@/components/ui/toast";
import { hasSupabaseConfig } from "@/lib/supabase/public";

/**
 * Layout protegido del panel.
 *
 * Vive en el route group `(panel)` — que no aparece en la URL — a proposito:
 * en App Router los layouts anidados SE COMPONEN, no se reemplazan. Con este
 * layout en `app/admin/` envolvia tambien a `/admin/login`, llamaba
 * requireAdmin(), redirigia al login, y volvia a envolverlo:
 * ERR_TOO_MANY_REDIRECTS. El login queda fuera del grupo.
 */

// Usa cookies() vía requireAdmin, así que ya es dinámica; explícito igual.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseConfig()) return <SetupNotice />;

  const admin = await requireAdmin();
  return (
    <>
      <AdminShell email={admin.email}>{children}</AdminShell>
      <Toaster />
    </>
  );
}
