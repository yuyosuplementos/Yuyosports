"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  faBars,
  faXmark,
  faCartShopping,
  faSearch,
  faChevronDown,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { CartDrawer } from "@/components/store/cart/cart-drawer";
import { useCart } from "@/lib/store/cart";
import { usePrefs } from "@/lib/store/prefs";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";
import type { Taxon } from "@/types/domain";
import type { CommerceSettings } from "@/lib/schemas/settings";

export function Header({
  categories,
  commerce,
}: {
  categories: Taxon[];
  commerce: CommerceSettings;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");

  const hasHydrated = useCart((s) => s.hasHydrated);
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const wholesaleMode = usePrefs((s) => s.wholesaleMode);
  const prefsHydrated = usePrefs((s) => s.hasHydrated);
  const toggleWholesale = usePrefs((s) => s.toggleWholesale);

  // Regla de oro anti-mismatch: antes de hidratar mostramos lo mismo que el server.
  const shownCount = hasHydrated ? count : 0;
  const shownWholesale = prefsHydrated && wholesaleMode;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setMenuOpen(false);
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  function handleToggleWholesale() {
    toggleWholesale();
    toast(!wholesaleMode ? "Precios mayoristas activados" : "Precios minoristas activados");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-charcoal/8 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-4 px-4 md:px-8">
          <Link href="/" className="font-display shrink-0 text-lg font-black tracking-widest uppercase">
            <span className="text-brand-live">YUYO</span>{" "}
            <span className="text-brand-charcoal">SPORTS</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setCatsOpen(true)}
              onMouseLeave={() => setCatsOpen(false)}
            >
              <button
                type="button"
                aria-expanded={catsOpen}
                onClick={() => setCatsOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-black tracking-widest text-brand-charcoal uppercase transition-colors hover:bg-brand-stone"
              >
                Categorías <Icon icon={faChevronDown} className="h-2.5 w-2.5" />
              </button>
              {catsOpen && (
                <div className="absolute top-full left-0 w-56 rounded-2xl border border-brand-charcoal/8 bg-white p-2 shadow-soft-lg">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/categoria/${c.slug}`}
                      onClick={() => setCatsOpen(false)}
                      className="block rounded-xl px-4 py-2.5 text-xs font-bold text-brand-charcoal transition-colors hover:bg-brand-stone hover:text-brand-moss"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/ofertas"
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-black tracking-widest uppercase transition-colors hover:bg-brand-stone",
                pathname === "/ofertas" ? "text-brand-moss" : "text-brand-charcoal",
              )}
            >
              <Icon icon={faBolt} className="h-2.5 w-2.5" /> Ofertas
            </Link>
            <Link
              href="/mayorista"
              className="rounded-xl px-4 py-2 text-[11px] font-black tracking-widest text-brand-charcoal uppercase transition-colors hover:bg-brand-stone"
            >
              Mayorista
            </Link>
          </nav>

          <form onSubmit={handleSearch} className="relative ml-auto hidden max-w-xs flex-1 md:block">
            <Icon
              icon={faSearch}
              className="pointer-events-none absolute top-1/2 left-4 h-3.5 w-3.5 -translate-y-1/2 text-brand-charcoal/35"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              aria-label="Buscar productos"
              className="w-full rounded-xl border-none bg-brand-stone py-2.5 pr-4 pl-11 text-sm font-medium text-brand-charcoal outline-none focus:ring-2 focus:ring-brand-live"
            />
          </form>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <button
              type="button"
              onClick={handleToggleWholesale}
              aria-pressed={shownWholesale}
              className={cn(
                "btn-premium hidden items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-black tracking-widest uppercase transition-all md:flex",
                shownWholesale
                  ? "bg-brand-charcoal text-brand-live"
                  : "bg-brand-stone text-brand-charcoal hover:bg-brand-charcoal/10",
              )}
            >
              Modo: <strong>{shownWholesale ? "Mayorista" : "Unidad"}</strong>
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir carrito (${shownCount} productos)`}
              className="relative rounded-xl p-3 text-brand-charcoal transition-colors hover:bg-brand-stone"
            >
              <Icon icon={faCartShopping} className="h-4 w-4" />
              <span
                className={cn(
                  "absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-live text-[10px] font-black text-brand-charcoal transition-transform",
                  shownCount > 0 ? "scale-100" : "scale-0",
                )}
              >
                {shownCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menú"
              aria-expanded={menuOpen}
              className="rounded-xl p-3 text-brand-charcoal transition-colors hover:bg-brand-stone lg:hidden"
            >
              <Icon icon={menuOpen ? faXmark : faBars} className="h-4 w-4" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-brand-charcoal/8 bg-white px-4 py-5 lg:hidden">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Icon
                icon={faSearch}
                className="pointer-events-none absolute top-1/2 left-4 h-3.5 w-3.5 -translate-y-1/2 text-brand-charcoal/35"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos…"
                aria-label="Buscar productos"
                className="w-full rounded-xl border-none bg-brand-stone py-3 pr-4 pl-11 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-live"
              />
            </form>
            <button
              type="button"
              onClick={handleToggleWholesale}
              className={cn(
                "mb-4 w-full rounded-xl px-4 py-3 text-[10px] font-black tracking-widest uppercase",
                shownWholesale
                  ? "bg-brand-charcoal text-brand-live"
                  : "bg-brand-stone text-brand-charcoal",
              )}
            >
              Modo: {shownWholesale ? "Mayorista" : "Unidad"}
            </button>
            <div className="flex flex-col">
              <Link
                href="/ofertas"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-xs font-black tracking-widest text-brand-charcoal uppercase hover:bg-brand-stone"
              >
                Ofertas
              </Link>
              <Link
                href="/mayorista"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-xs font-black tracking-widest text-brand-charcoal uppercase hover:bg-brand-stone"
              >
                Mayorista
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/categoria/${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-xs font-bold text-brand-charcoal hover:bg-brand-stone"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} commerce={commerce} />
    </>
  );
}
