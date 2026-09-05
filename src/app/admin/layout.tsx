import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/toast";

// Usa cookies() vía requireAdmin, así que ya es dinámica; explícito igual.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <>
      <AdminShell email={admin.email}>{children}</AdminShell>
      <Toaster />
    </>
  );
}
