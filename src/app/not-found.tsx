import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-5xl font-black text-brand-charcoal">404</p>
      <p className="text-sm text-brand-charcoal/50">No encontramos la página que buscabas.</p>
      <Link
        href="/"
        className="btn-premium rounded-2xl bg-brand-live px-6 py-3 text-xs font-black tracking-widest text-brand-charcoal uppercase"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
