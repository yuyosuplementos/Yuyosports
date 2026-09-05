"use client";

import Image from "next/image";
import { useState } from "react";
import { faBan, faCartPlus, faCheck, faBolt } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { Price, PriceLegend, DiscountBadge, WholesalePill } from "@/components/store/price";
import { storagePublicUrl, PRODUCT_PLACEHOLDER } from "@/lib/utils/image";
import { usePrefs, selectWholesale } from "@/lib/store/prefs";
import { useCart } from "@/lib/store/cart";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/domain";

export function ProductCard({
  product,
  onQuickView,
  priority,
}: {
  product: Product;
  onQuickView: (p: Product) => void;
  priority?: boolean;
}) {
  const wholesale = usePrefs(selectWholesale);
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const src = storagePublicUrl(product.imagePath) ?? PRODUCT_PLACEHOLDER;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (product.isOutOfStock) return;
    // Sin gate de login: se compra como invitado (decisión 1).
    add(product, product.flavors[0] ?? null, 1, wholesale);
    toast(`${product.name} agregado al carrito`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border border-brand-charcoal/8 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-hover",
        product.isOutOfStock && "opacity-70 grayscale-[50%]",
      )}
    >
      <button
        type="button"
        onClick={() => onQuickView(product)}
        aria-label={`Ver detalle de ${product.name}`}
        className="img-zoom-container relative aspect-square w-full bg-brand-stone focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-moss"
      >
        <Image
          src={src}
          alt={product.imageAlt ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          priority={priority}
          unoptimized={src.startsWith("data:")}
        />
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {product.isOutOfStock && (
            <span className="rounded-full bg-brand-charcoal px-2.5 py-1 text-[10px] font-black tracking-widest text-white uppercase">
              Sin stock
            </span>
          )}
          {product.isOffer && !product.isOutOfStock && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black tracking-widest text-white uppercase">
              <Icon icon={faBolt} className="h-2.5 w-2.5" /> Oferta
            </span>
          )}
          <DiscountBadge product={product} />
        </div>
        <div className="pointer-events-none absolute top-3 right-3">
          <WholesalePill />
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-[10px] font-black tracking-widest text-brand-moss uppercase">
          {product.brand.name}
        </span>
        <h3 className="font-display text-sm leading-snug font-bold text-brand-charcoal">
          {product.name}
        </h3>
        {product.description && (
          <p className="line-clamp-1 text-xs text-brand-charcoal/50">{product.description}</p>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <div>
            <Price product={product} />
            <PriceLegend />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.isOutOfStock}
            className={cn(
              "btn-premium flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[11px] font-black tracking-widest uppercase transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-moss",
              product.isOutOfStock
                ? "cursor-not-allowed bg-brand-stone text-brand-charcoal/40"
                : added
                  ? "bg-brand-charcoal text-brand-live"
                  : "bg-brand-live text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-live",
            )}
          >
            {product.isOutOfStock ? (
              <><Icon icon={faBan} className="h-3 w-3" /> Sin stock</>
            ) : added ? (
              <><Icon icon={faCheck} className="h-3 w-3" /> Añadido</>
            ) : (
              <><Icon icon={faCartPlus} className="h-3 w-3" /> Agregar</>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
