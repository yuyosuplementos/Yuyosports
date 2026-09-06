"use client";

import { useCallback, useEffect, useReducer } from "react";
import type { Product } from "@/types/domain";

export interface Filters {
  category: string; // slug | "all"
  brand: string; // slug | "all"
  saleOnly: boolean;
  search: string;
}

export const EMPTY_FILTERS: Filters = {
  category: "all",
  brand: "all",
  saleOnly: false,
  search: "",
};

type Action =
  | { type: "set"; key: keyof Filters; value: string | boolean }
  | { type: "toggle"; key: "saleOnly" }
  | { type: "reset" }
  | { type: "hydrate"; value: Filters };

function reducer(state: Filters, action: Action): Filters {
  switch (action.type) {
    case "set":
      return { ...state, [action.key]: action.value };
    case "toggle":
      return { ...state, [action.key]: !state[action.key] };
    case "reset":
      return EMPTY_FILTERS;
    case "hydrate":
      return action.value;
  }
}

const PARAM = { category: "categoria", brand: "marca", saleOnly: "ofertas", search: "q" } as const;

function toSearchParams(f: Filters): string {
  const p = new URLSearchParams();
  if (f.category !== "all") p.set(PARAM.category, f.category);
  if (f.brand !== "all") p.set(PARAM.brand, f.brand);
  if (f.saleOnly) p.set(PARAM.saleOnly, "1");
  if (f.search.trim()) p.set(PARAM.search, f.search.trim());
  return p.toString();
}

function fromSearchParams(qs: string, initial: Filters): Filters {
  const p = new URLSearchParams(qs);
  return {
    category: p.get(PARAM.category) ?? initial.category,
    brand: p.get(PARAM.brand) ?? initial.brand,
    saleOnly: p.get(PARAM.saleOnly) === "1" || initial.saleOnly,
    search: p.get(PARAM.search) ?? initial.search,
  };
}

/**
 * Filtros en cliente + URL compartible.
 *
 * Se sincroniza con history.replaceState en vez de useSearchParams/router:
 * leer searchParams en page.tsx volveria dinamica la home y perderiamos el
 * render estatico, que es la pagina mas visitada. Asi la URL sigue siendo
 * copiable (/?categoria=creatinas&marca=star-nutrition) y la pagina estatica.
 */
export function useFilters(initial: Filters = EMPTY_FILTERS, syncUrl = true) {
  const [filters, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    if (!syncUrl) return;
    dispatch({ type: "hydrate", value: fromSearchParams(window.location.search, initial) });
    // Solo al montar: despues manda el estado local.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!syncUrl) return;
    const qs = toSearchParams(filters);
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [filters, syncUrl]);

  const set = useCallback(
    (key: keyof Filters, value: string | boolean) => dispatch({ type: "set", key, value }),
    [],
  );
  const toggle = useCallback((key: "saleOnly") => dispatch({ type: "toggle", key }), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  return { filters, set, toggle, reset };
}

/**
 * Combinacion AND, en el mismo orden que index.html:1655-1684.
 * La busqueda mira name | brand | category (no description), igual que el original.
 */
export function applyFilters(products: Product[], f: Filters): Product[] {
  const q = f.search.trim().toLowerCase();
  return products.filter((p) => {
    if (f.category !== "all" && p.category.slug !== f.category) return false;
    if (f.brand !== "all" && p.brand.slug !== f.brand) return false;
    if (f.saleOnly && !p.isOffer) return false;
    if (q) {
      const hay = `${p.name} ${p.brand.name} ${p.category.name}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function countActive(f: Filters): number {
  return (
    (f.category !== "all" ? 1 : 0) +
    (f.brand !== "all" ? 1 : 0) +
    (f.saleOnly ? 1 : 0) +
    (f.search.trim() ? 1 : 0)
  );
}
