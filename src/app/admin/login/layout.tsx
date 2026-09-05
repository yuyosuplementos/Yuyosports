import { SetupNotice } from "@/components/admin/setup-notice";
import { hasSupabaseConfig } from "@/lib/supabase/public";

// Layout desnudo: NO llama requireAdmin, si no el login redirigiría a sí mismo.
export const dynamic = "force-dynamic";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseConfig()) return <SetupNotice />;
  return <>{children}</>;
}
