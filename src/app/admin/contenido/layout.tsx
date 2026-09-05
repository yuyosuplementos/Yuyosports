import Link from "next/link";
import { SECTIONS } from "@/components/admin/settings-form";

export default function ContenidoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-black text-brand-charcoal">Contenido del sitio</h1>
      <nav className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.key}
            href={`/admin/contenido/${s.key}`}
            className="rounded-xl bg-white px-4 py-2.5 text-[11px] font-black tracking-widest text-brand-charcoal uppercase shadow-card transition-colors hover:bg-brand-live"
          >
            {s.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
