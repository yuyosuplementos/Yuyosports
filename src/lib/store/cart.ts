"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CART_STORAGE_KEY } from "@/lib/constants";
import type { CartLine, Product } from "@/types/domain";

export function lineIdOf(productId: string, flavor: string | null, isWholesale: boolean) {
  return `${productId}::${flavor ?? ""}::${isWholesale ? "w" : "r"}`;
}

interface CartState {
  lines: CartLine[];
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  add: (product: Product, flavor: string | null, qty: number, isWholesale: boolean) => void;
  setQty: (lineId: string, delta: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      add: (product, flavor, qty, isWholesale) =>
        set((s) => {
          const id = lineIdOf(product.id, flavor, isWholesale);
          const existing = s.lines.find((l) => l.lineId === id);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.lineId === id ? { ...l, qty: Math.min(l.qty + qty, 99) } : l,
              ),
            };
          }
          const line: CartLine = {
            lineId: id,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brandName: product.brand.name,
            imagePath: product.imagePath,
            // Congelado al agregar, igual que en el sitio viejo.
            unitPrice: isWholesale ? product.wholesalePrice : product.price,
            flavor,
            qty: Math.min(qty, 99),
            isWholesale,
            addedAt: Date.now(),
          };
          return { lines: [...s.lines, line] };
        }),

      setQty: (lineId, delta) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.lineId === lineId ? { ...l, qty: l.qty + delta } : l))
            .filter((l) => l.qty > 0),
        })),

      remove: (lineId) => set((s) => ({ lines: s.lines.filter((l) => l.lineId !== lineId) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Clave: sin esto, el store se rehidrata durante el primer render del
      // cliente y el HTML deja de coincidir con el del server (badge en 0).
      // La rehidratacion se dispara a mano desde <CartHydrator/>.
      skipHydration: true,
      partialize: (s) => ({ lines: s.lines }),
      onRehydrateStorage: () => (s) => s?.setHasHydrated(true),
      migrate: (persisted) => {
        // El formato viejo era un array pelado; persist guarda {state, version}.
        if (Array.isArray(persisted)) return { lines: [] as CartLine[] };
        return persisted as { lines: CartLine[] };
      },
    },
  ),
);

/** Selectores estables (evitan recrear objetos en cada render). */
export const selectCount = (s: CartState) => s.lines.reduce((a, l) => a + l.qty, 0);
export const selectSubtotal = (s: CartState) =>
  s.lines.reduce((a, l) => a + l.unitPrice * l.qty, 0);
export const selectWholesaleSubtotal = (s: CartState) =>
  s.lines.reduce((a, l) => (l.isWholesale ? a + l.unitPrice * l.qty : a), 0);
export const selectHasWholesale = (s: CartState) => s.lines.some((l) => l.isWholesale);
