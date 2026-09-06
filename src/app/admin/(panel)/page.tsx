import Link from "next/link";
import { getAdminStats } from "@/lib/data/admin";
import { hasSupabaseConfig } from "@/lib/supabase/public";

export default async function AdminDashboard() {
  if (!hasSupabaseConfig()) {
    return (
      <p className="rounded-2xl bg-white p-6 text-sm text-brand-charcoal/60 shadow-card">
        Falta configurar Supabase. Copiá <code>.env.example</code> a <code>.env.local</code>.
      </p>
    );
  }

  const stats = await getAdminStats();
  const cards = [
    { label: "Total productos", value: stats.total },
    { label: "Sin stock", value: stats.out_of_stock },
    { label: "En oferta", value: stats.on_offer },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-black text-brand-charcoal">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-3xl bg-white p-6 shadow-card">
            <p className="text-[10px] font-black tracking-widest text-brand-charcoal/45 uppercase">
              {c.label}
            </p>
            <p className="font-display mt-2 text-3xl font-black text-brand-charcoal">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/productos/nuevo"
          className="btn-premium rounded-2xl bg-brand-live px-6 py-3 text-xs font-black tracking-widest text-brand-charcoal uppercase"
        >
          Nuevo producto
        </Link>
        <Link
          href="/admin/contenido/general"
          className="btn-premium rounded-2xl border border-brand-charcoal/15 bg-white px-6 py-3 text-xs font-black tracking-widest text-brand-charcoal uppercase"
        >
          Editar contenido
        </Link>
      </div>
    </div>
  );
}
