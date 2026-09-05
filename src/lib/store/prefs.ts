"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { PREFS_STORAGE_KEY } from "@/lib/constants";

interface PrefsState {
  wholesaleMode: boolean;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  toggleWholesale: () => void;
  setWholesale: (v: boolean) => void;
}

/**
 * El modo mayorista AHORA PERSISTE. Que en el sitio viejo se perdiera al
 * recargar era un defecto, no una decision: un revendedor que refresca vuelve
 * a ver precios minoristas y puede pedir mal.
 *
 * No se implementa con cookie + render en server porque leer cookies() en
 * page.tsx desactivaria el render estatico de toda la home para ahorrar un
 * frame de flash al ~5% de usuarios que activan el modo.
 */
export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      wholesaleMode: false,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      toggleWholesale: () => set((s) => ({ wholesaleMode: !s.wholesaleMode })),
      setWholesale: (v) => set({ wholesaleMode: v }),
    }),
    {
      name: PREFS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      skipHydration: true,
      partialize: (s) => ({ wholesaleMode: s.wholesaleMode }),
      onRehydrateStorage: () => (s) => s?.setHasHydrated(true),
    },
  ),
);

/**
 * Modo mayorista efectivo para renderizar precios.
 * Antes de hidratar devuelve false = lo mismo que renderizo el server.
 * Esa es la regla de oro contra el hydration mismatch.
 */
export const selectWholesale = (s: PrefsState) => s.hasHydrated && s.wholesaleMode;
