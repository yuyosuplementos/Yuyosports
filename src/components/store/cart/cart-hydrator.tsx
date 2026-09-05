"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/store/cart";
import { usePrefs } from "@/lib/store/prefs";

/**
 * Dispara la rehidratación de los stores persistidos DESPUÉS del primer render.
 *
 * Los stores usan skipHydration: sin esto, zustand leería localStorage durante
 * el render inicial del cliente y el HTML dejaría de coincidir con el del
 * server (que siempre renderiza carrito vacío y modo minorista), y React
 * descartaría el árbol con "Hydration failed".
 */
export function CartHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate();
    void usePrefs.persist.rehydrate();
  }, []);
  return null;
}
