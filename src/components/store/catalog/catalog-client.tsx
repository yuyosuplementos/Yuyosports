"use client";

import { useMemo, useState } from "react";
import {
  faSearch,
  faXmark,
  faDumbbell,
  faBolt,
  faFilterCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { ProductCard } from "./product-card";
import { QuickView } from "./quick-view";
import { useFilters, applyFilters, countActive, EMPTY_FILTERS, type Filters } from "./use-filters";
import { cn } from "@/lib/utils/cn";
import type { Product, Taxon } from "@/types/domain";

const QUICK = ["proteinas", "creatinas", "pre-entrenos", "aminoacidos"];

export function CatalogClient({
  products,
  categories,
  brands,
  initialFilters,
  syncUrl = true,
  title = "Nuestro catálogo",
}: {
  products: Product[];
  categories: Taxon[];
  brands: Taxon[];
  initialFilters?: Partial<Filters>;
  syncUrl?: boolean;
  title?: string;
}) {
  const { filters, set, toggle, reset } = useFilters(
    { ...EMPTY_FILTERS, ...initialFilters },
    syncUrl,
  );
  const [quickView, setQuickView] = useState<Product | null>(null);

  const filtered = useMemo(() => applyFilters(products, filters), [products, filters]);
  const active = countActive(filters);

  // Solo los quick-filters cuyas categorías existen y tienen productos.
  const quickCats = categories.filter((c) => QUICK.includes(c.slug));

  return (
    <section id="catalog" className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <header className="mb-8 flex flex-col gap-2">
        <span className="text-[10px] font-black tracking-widest text-brand-moss uppercase">
          {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
        </span>
        <h2 className="font-display text-2xl font-black tracking-tight text-brand-charcoal md:text-3xl">
          {title}
        </h2>
      </header>

      {/* Quick filters. Ahora filtran por CATEGORÍA de verdad: en el sitio viejo
          applyCategoryFilter() escribía en state.search, así que el botón
          "Proteínas" era una búsqueda de texto y no un filtro de categoría. */}
      {quickCats.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {quickCats.map((c) => {
            const on = filters.category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={on}
                onClick={() => set("category", on ? "all" : c.slug)}
                className={cn(
                  "btn-premium rounded-2xl px-5 py-2.5 text-[11px] font-black tracking-widest uppercase transition-all",
                  on
                    ? "bg-brand-charcoal text-brand-live"
                    : "border border-brand-charcoal/10 bg-white text-brand-charcoal hover:border-brand-live hover:bg-brand-stone",
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-brand-charcoal/8 bg-brand-stone/60 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Icon
            icon={faSearch}
            className="pointer-events-none absolute top-1/2 left-4 h-3.5 w-3.5 -translate-y-1/2 text-brand-charcoal/35"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Buscar por producto, marca o categoría..."
            aria-label="Buscar productos"
            className="w-full rounded-xl border-none bg-white py-3 pr-4 pl-11 text-sm font-medium text-brand-charcoal shadow-card outline-none focus:ring-2 focus:ring-brand-live"
          />
        </div>

        <select
          value={filters.category}
          onChange={(e) => set("category", e.target.value)}
          aria-label="Filtrar por categoría"
          className="rounded-xl border-none bg-white px-4 py-3 text-sm font-medium text-brand-charcoal shadow-card outline-none focus:ring-2 focus:ring-brand-live"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filters.brand}
          onChange={(e) => set("brand", e.target.value)}
          aria-label="Filtrar por marca"
          className="rounded-xl border-none bg-white px-4 py-3 text-sm font-medium text-brand-charcoal shadow-card outline-none focus:ring-2 focus:ring-brand-live"
        >
          <option value="all">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={filters.isGym}
            onClick={() => toggle("isGym")}
            className={cn(
              "btn-premium flex items-center gap-2 rounded-xl px-4 py-3 text-[11px] font-black tracking-widest uppercase transition-all",
              filters.isGym
                ? "bg-brand-live text-brand-charcoal"
                : "bg-white text-brand-charcoal shadow-card hover:bg-brand-stone",
            )}
          >
            <Icon icon={faDumbbell} className="h-3 w-3" /> Gym
          </button>
          <button
            type="button"
            aria-pressed={filters.saleOnly}
            onClick={() => toggle("saleOnly")}
            className={cn(
              "btn-premium flex items-center gap-2 rounded-xl px-4 py-3 text-[11px] font-black tracking-widest uppercase transition-all",
              filters.saleOnly
                ? "bg-red-600 text-white"
                : "bg-white text-brand-charcoal shadow-card hover:bg-brand-stone",
            )}
          >
            <Icon icon={faBolt} className="h-3 w-3" /> Ofertas
          </button>
        </div>
      </div>

      {active > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-brand-charcoal px-4 py-3">
          <span className="text-[10px] font-black tracking-widest text-brand-live uppercase">
            Filtros activos:
          </span>
          {filters.isGym && <Chip label="Gym" onClear={() => toggle("isGym")} />}
          {filters.saleOnly && <Chip label="Solo ofertas" onClear={() => toggle("saleOnly")} />}
          {filters.category !== "all" && (
            <Chip
              label={categories.find((c) => c.slug === filters.category)?.name ?? filters.category}
              onClear={() => set("category", "all")}
            />
          )}
          {filters.brand !== "all" && (
            <Chip
              label={brands.find((b) => b.slug === filters.brand)?.name ?? filters.brand}
              onClear={() => set("brand", "all")}
            />
          )}
          {filters.search.trim() && (
            <Chip label={filters.search.trim()} onClear={() => set("search", "")} />
          )}
          <button
            type="button"
            onClick={reset}
            className="ml-auto flex items-center gap-1.5 text-[10px] font-black tracking-widest text-white/60 uppercase transition-colors hover:text-brand-live"
          >
            <Icon icon={faFilterCircleXmark} className="h-3 w-3" /> Limpiar todo
          </button>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickView} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-brand-charcoal/15 py-20 text-center">
          <Icon icon={faSearch} className="h-8 w-8 text-brand-charcoal/20" />
          <div>
            <p className="font-display text-lg font-black text-brand-charcoal">
              No encontramos productos
            </p>
            <p className="mt-1 text-sm text-brand-charcoal/50">
              Probá con otros filtros o limpiá la búsqueda.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="btn-premium rounded-2xl bg-brand-charcoal px-6 py-3 text-[11px] font-black tracking-widest text-brand-live uppercase"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      <QuickView product={quickView} onClose={() => setQuickView(null)} />
    </section>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Quitar filtro ${label}`}
        className="text-white/50 hover:text-brand-live"
      >
        <Icon icon={faXmark} className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}
