import { SetupNotice } from "@/components/admin/setup-notice";
import { hasSupabaseConfig } from "@/lib/supabase/public";

/**
 * El login vive FUERA del route group `(panel)`, así que este layout no
 * compone con el layout protegido y nunca llama requireAdmin().
 */
export const dynamic = "force-dynamic";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseConfig()) return <SetupNotice />;
  return <>{children}</>;
}
