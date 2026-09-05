"use client";

import Image from "next/image";
import { useState } from "react";
import { faXmark, faMinus, faPlus, faCartPlus, faBan } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/overlay";
import { Price, PriceLegend, DiscountBadge, WholesalePill } from "@/components/store/price";
import { storagePublicUrl, PRODUCT_PLACEHOLDER } from "@/lib/utils/image";
import { usePrefs, selectWholesale } from "@/lib/store/prefs";
import { useCart } from "@/lib/store/cart";
import { toast } from "@/components/ui/toast";
import type { Product } from "@/types/domain";

export function QuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  return (
    <Modal open={!!product} onClose={onClose} labelledBy="qv-title" className="max-w-3xl">
      {/* key: al cambiar de producto se remonta el cuerpo y el estado de sabor
          y cantidad se reinicia solo. Antes esto era un useEffect con setState,
          que dispara un render en cascada. */}
      {product && <QuickViewBody key={product.id} product={product} onClose={onClose} />}
    </Modal>
  );
}

function QuickViewBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const wholesale = usePrefs(selectWholesale);
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [flavor, setFlavor] = useState<string | null>(product.flavors[0] ?? null);

  function handleAdd() {
    if (product.isOutOfStock) return;
    add(product, flavor, qty, wholesale);
    toast(`${product.name} agregado al carrito`);
    onClose();
  }

  const src = storagePublicUrl(product.imagePath) ?? PRODUCT_PLACEHOLDER;

  return (
    <div className="grid gap-0 md:grid-cols-2">
      <div className="relative aspect-square bg-brand-stone">
        <Image
          src={src}
          alt={product.imageAlt ?? product.name}
          fill
          sizes="(max-width: 768px) 100vw, 384px"
          className="object-cover"
          unoptimized={src.startsWith("data:")}
        />
        <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5">
          {product.isOutOfStock && (
            <span className="rounded-full bg-brand-charcoal px-2.5 py-1 text-[10px] font-black tracking-widest text-white uppercase">
              Sin stock
            </span>
          )}
          <DiscountBadge product={product} />
          <WholesalePill />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-black tracking-widest text-brand-moss uppercase">
              {product.brand.name} · {product.category.name}
            </span>
            <h2 id="qv-title" className="font-display mt-1 text-xl font-black text-brand-charcoal">
              {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-2 text-brand-charcoal/40 transition-colors hover:bg-brand-stone hover:text-brand-charcoal"
          >
            <Icon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        <div>
          <Price product={product} size="lg" />
          <PriceLegend />
        </div>

        {product.description && (
          <p className="text-sm leading-relaxed text-brand-charcoal/60">{product.description}</p>
        )}

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
              className="rounded-lg px-3 py-2 text-brand-charcoal transition-colors hover:bg-white disabled:opacity-40"
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
              className="rounded-lg px-3 py-2 text-brand-charcoal transition-colors hover:bg-white disabled:opacity-40"
            >
              <Icon icon={faPlus} className="h-3 w-3" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={product.isOutOfStock}
          className="btn-premium mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-live px-6 py-4 text-xs font-black tracking-widest text-brand-charcoal uppercase transition-all hover:bg-brand-charcoal hover:text-brand-live disabled:cursor-not-allowed disabled:bg-brand-stone disabled:text-brand-charcoal/40"
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
    </div>
  );
}
