"use client";

import Image from "next/image";
import { useState } from "react";
import {
  faXmark,
  faMinus,
  faPlus,
  faTrash,
  faCartShopping,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { Drawer } from "@/components/ui/overlay";
import { CheckoutModal } from "@/components/store/checkout-modal";
import {
  useCart,
  selectSubtotal,
  selectWholesaleSubtotal,
  selectHasWholesale,
} from "@/lib/store/cart";
import { formatARS } from "@/lib/utils/format";
import { storagePublicUrl, PRODUCT_PLACEHOLDER } from "@/lib/utils/image";
import { cn } from "@/lib/utils/cn";
import type { CommerceSettings } from "@/lib/schemas/settings";

export function CartDrawer({
  open,
  onClose,
  commerce,
}: {
  open: boolean;
  onClose: () => void;
  commerce: CommerceSettings;
}) {
  const lines = useCart((s) => s.lines);
  const hasHydrated = useCart((s) => s.hasHydrated);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart(selectSubtotal);
  const wholesaleSubtotal = useCart(selectWholesaleSubtotal);
  const hasWholesale = useCart(selectHasWholesale);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Decisión 6: el mínimo mayorista ahora BLOQUEA. En el sitio viejo era
  // texto decorativo y entraban pedidos que después había que rechazar.
  const wholesaleShortfall = hasWholesale
    ? Math.max(0, commerce.wholesaleMinimum - wholesaleSubtotal)
    : 0;
  const blocked = wholesaleShortfall > 0;
  const empty = !hasHydrated || lines.length === 0;

  return (
    <>
      <Drawer open={open} onClose={onClose} labelledBy="cart-title">
        <header className="flex items-center justify-between border-b border-brand-charcoal/8 px-6 py-5">
          <h2 id="cart-title" className="font-display text-lg font-black text-brand-charcoal">
            Tu carrito
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="rounded-full p-2 text-brand-charcoal/40 transition-colors hover:bg-brand-stone hover:text-brand-charcoal"
          >
            <Icon icon={faXmark} className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {empty ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Icon icon={faCartShopping} className="h-8 w-8 text-brand-charcoal/15" />
              <p className="text-sm font-bold text-brand-charcoal">Tu carrito está vacío</p>
              <p className="text-xs text-brand-charcoal/50">
                Explorá el catálogo y sumá tus suplementos.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {lines.map((l) => {
                const src = storagePublicUrl(l.imagePath) ?? PRODUCT_PLACEHOLDER;
                return (
                  <li key={l.lineId} className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-brand-stone">
                      <Image
                        src={src}
                        alt={l.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized={src.startsWith("data:")}
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black tracking-widest text-brand-moss uppercase">
                            {l.brandName}
                          </p>
                          <p className="truncate text-xs font-bold text-brand-charcoal">{l.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(l.lineId)}
                          aria-label={`Quitar ${l.name}`}
                          className="shrink-0 p-1 text-brand-charcoal/30 transition-colors hover:text-red-600"
                        >
                          <Icon icon={faTrash} className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {l.flavor && (
                          <span className="rounded-full bg-brand-stone px-2 py-0.5 text-[10px] font-bold text-brand-charcoal/60">
                            {l.flavor}
                          </span>
                        )}
                        {l.isWholesale && (
                          <span className="rounded-full bg-brand-charcoal px-2 py-0.5 text-[10px] font-black tracking-wider text-brand-live uppercase">
                            Mayorista
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 rounded-lg bg-brand-stone p-0.5">
                          <button
                            type="button"
                            onClick={() => setQty(l.lineId, -1)}
                            aria-label="Restar uno"
                            className="rounded px-2 py-1 text-brand-charcoal transition-colors hover:bg-white"
                          >
                            <Icon icon={faMinus} className="h-2.5 w-2.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-black">{l.qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(l.lineId, 1)}
                            aria-label="Sumar uno"
                            className="rounded px-2 py-1 text-brand-charcoal transition-colors hover:bg-white"
                          >
                            <Icon icon={faPlus} className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        <span className="text-sm font-black text-brand-charcoal">
                          {formatARS(l.unitPrice * l.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!empty && (
          <footer className="border-t border-brand-charcoal/8 px-6 py-5">
            {blocked && (
              <p className="mb-3 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-[11px] font-bold text-red-700">
                <Icon icon={faTriangleExclamation} className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                  La compra mayorista mínima es de {formatARS(commerce.wholesaleMinimum)}. Te faltan{" "}
                  {formatARS(wholesaleShortfall)}.
                </span>
              </p>
            )}
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-[10px] font-black tracking-widest text-brand-charcoal/50 uppercase">
                Total
              </span>
              <span className="font-display text-2xl font-black text-brand-charcoal">
                {formatARS(subtotal)}
              </span>
            </div>
            <button
              type="button"
              disabled={blocked}
              onClick={() => {
                // Cerramos el drawer: tener los dos overlays abiertos a la vez
                // confunde el foco y tapa medio formulario.
                setCheckoutOpen(true);
                onClose();
              }}
              className={cn(
                "btn-premium w-full rounded-2xl px-6 py-4 text-xs font-black tracking-widest uppercase transition-all",
                blocked
                  ? "cursor-not-allowed bg-brand-stone text-brand-charcoal/40"
                  : "bg-brand-live text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-live",
              )}
            >
              Finalizar compra
            </button>
          </footer>
        )}
      </Drawer>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        commerce={commerce}
        onDone={() => {
          setCheckoutOpen(false);
          onClose();
        }}
      />
    </>
  );
}
