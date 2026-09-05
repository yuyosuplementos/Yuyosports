"use client";

import { useState } from "react";
import { faMinus, faPlus, faCartPlus, faBan } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { Price, PriceLegend } from "@/components/store/price";
import { useCart } from "@/lib/store/cart";
import { usePrefs, selectWholesale } from "@/lib/store/prefs";
import { toast } from "@/components/ui/toast";
import type { Product } from "@/types/domain";

/** Isla de cliente de la ficha de producto: sabor, cantidad y agregar. */
export function BuyBox({ product }: { product: Product }) {
  const wholesale = usePrefs(selectWholesale);
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [flavor, setFlavor] = useState<string | null>(product.flavors[0] ?? null);

  function handleAdd() {
    if (product.isOutOfStock) return;
    add(product, flavor, qty, wholesale);
    toast(`${product.name} agregado al carrito`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Price product={product} size="lg" />
        <PriceLegend />
      </div>

      {product.flavors.length > 0 && (
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black tracking-widest text-brand-charcoal/50 uppercase">
            Sabor
          </span>
          <select
            value={flavor ?? ""}
            onChange={(e) => setFlavor(e.target.value)}
            className="rounded-xl border-none bg-brand-stone px-4 py-3 text-sm font-medium text-brand-charcoal outline-none focus:ring-2 focus:ring-brand-live"
          >
            {product.flavors.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black tracking-widest text-brand-charcoal/50 uppercase">
          Cantidad
        </span>
        <div className="flex items-center gap-1 rounded-xl bg-brand-stone p-1">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Restar uno"
            disabled={product.isOutOfStock}
            className="rounded-lg px-3 py-2 transition-colors hover:bg-white disabled:opacity-40"
          >
            <Icon icon={faMinus} className="h-3 w-3" />
          </button>
          <span aria-live="polite" className="w-8 text-center text-sm font-black">
            {product.isOutOfStock ? 0 : qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Sumar uno"
            disabled={product.isOutOfStock}
            className="rounded-lg px-3 py-2 transition-colors hover:bg-white disabled:opacity-40"
          >
            <Icon icon={faPlus} className="h-3 w-3" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={product.isOutOfStock}
        className="btn-premium flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-live px-6 py-4 text-xs font-black tracking-widest text-brand-charcoal uppercase transition-all hover:bg-brand-charcoal hover:text-brand-live disabled:cursor-not-allowed disabled:bg-brand-stone disabled:text-brand-charcoal/40"
      >
        {product.isOutOfStock ? (
          <>
            <Icon icon={faBan} className="h-3.5 w-3.5" /> Sin stock
          </>
        ) : (
          <>
            <Icon icon={faCartPlus} className="h-3.5 w-3.5" /> Agregar al carrito
          </>
        )}
      </button>
    </div>
  );
}
