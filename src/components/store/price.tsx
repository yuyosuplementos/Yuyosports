"use client";

import { usePrefs, selectWholesale } from "@/lib/store/prefs";
import { formatARS, discountPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/domain";

/**
 * Resuelve el precio segun el modo minorista/mayorista.
 *
 * El server siempre renderiza minorista (default seguro) y selectWholesale()
 * devuelve false hasta que hidrata, asi que el primer render del cliente
 * coincide byte a byte con el del server. El precio mayorista aparece un
 * frame despues, sin mismatch.
 */
export function Price({ product, size = "md" }: { product: Product; size?: "md" | "lg" }) {
  const wholesale = usePrefs(selectWholesale);
  const price = wholesale ? product.wholesalePrice : product.price;
  // El panel ya permite cargar un precio anterior menor o igual al actual.
  // Tacharlo en ese caso parecería un aumento: solo se muestra si es mayor.
  const showOld = !wholesale && !!product.oldPrice && product.oldPrice > product.price;

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span
        className={cn(
          "font-display font-black tracking-tight text-brand-charcoal",
          size === "lg" ? "text-3xl" : "text-xl",
        )}
      >
        {formatARS(price)}
      </span>
      {showOld && (
        <span className="text-sm font-medium text-brand-charcoal/40 line-through">
          {formatARS(product.oldPrice!)}
        </span>
      )}
    </div>
  );
}

/** Leyenda bajo el precio. Solo aparece en modo mayorista. */
export function PriceLegend({ className }: { className?: string }) {
  const wholesale = usePrefs(selectWholesale);
  if (!wholesale) return null;
  return (
    <span className={cn("text-[10px] font-bold tracking-widest text-brand-moss uppercase", className)}>
      Precio por cantidad
    </span>
  );
}

/** Badge de descuento. Se oculta en modo mayorista, igual que en el sitio viejo. */
export function DiscountBadge({ product }: { product: Product }) {
  const wholesale = usePrefs(selectWholesale);
  const pct = discountPercent(product.price, product.oldPrice);
  if (wholesale || product.isOutOfStock || pct <= 0) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-brand-live px-2.5 py-1 text-[10px] font-black tracking-widest text-brand-charcoal uppercase">
      -{pct}% OFF
    </span>
  );
}

/** Pill que indica que se estan viendo precios mayoristas. */
export function WholesalePill() {
  const wholesale = usePrefs(selectWholesale);
  if (!wholesale) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-brand-charcoal px-2.5 py-1 text-[10px] font-black tracking-widest text-brand-live uppercase">
      Mayorista
    </span>
  );
}
