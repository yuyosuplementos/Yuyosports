"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/overlay";
import { toast } from "@/components/ui/toast";
import { useCart, selectSubtotal } from "@/lib/store/cart";
import { checkoutSchema, type CheckoutInput } from "@/lib/schemas/checkout";
import { buildOrderMessage, waLink } from "@/lib/utils/whatsapp";
import { formatARS } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { CommerceSettings } from "@/lib/schemas/settings";

export function CheckoutModal({
  open,
  onClose,
  commerce,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  commerce: CommerceSettings;
  onDone: () => void;
}) {
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(selectSubtotal);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema) });

  function onSubmit(data: CheckoutInput) {
    const message = buildOrderMessage(data, lines);
    // No se persiste la orden (decisión 2): el pedido se cierra en WhatsApp.
    window.open(waLink(commerce.whatsappPhone, message), "_blank", "noopener,noreferrer");
    clear();
    reset();
    toast("¡Pedido generado! Abriendo WhatsApp…");
    onDone();
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="checkout-title" className="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="checkout-title" className="font-display text-xl font-black text-brand-charcoal">
              Finalizar compra
            </h2>
            <p className="mt-1 text-xs text-brand-charcoal/50">
              Dejanos tu nombre y seguimos por WhatsApp.
            </p>
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

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black tracking-widest text-brand-charcoal/50 uppercase">
            Tu nombre
          </span>
          <input
            {...register("name")}
            placeholder="Juan Pérez"
            autoFocus
            className={cn(
              "w-full rounded-xl border-none px-4 py-3 text-sm font-medium text-brand-charcoal outline-none transition-shadow",
              errors.name
                ? "bg-red-50 ring-2 ring-red-400"
                : "bg-brand-stone focus:ring-2 focus:ring-brand-live",
            )}
          />
          {errors.name && (
            <span className="text-[11px] font-bold text-red-600">{errors.name.message}</span>
          )}
        </label>

        {/* Resumen del pedido: lo mismo que va a viajar al mensaje. */}
        <div className="flex flex-col gap-3 rounded-2xl bg-brand-stone px-5 py-4">
          <span className="text-[10px] font-black tracking-widest text-brand-charcoal/50 uppercase">
            Tu pedido
          </span>
          <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto">
            {lines.map((l) => (
              <li key={l.lineId} className="flex items-start justify-between gap-3 text-xs">
                <span className="min-w-0 text-brand-charcoal">
                  <span className="font-bold">{l.name}</span>
                  {l.flavor && <span className="text-brand-charcoal/50"> · {l.flavor}</span>}
                  {l.isWholesale && (
                    <span className="ml-1 rounded-full bg-brand-charcoal px-1.5 py-0.5 text-[9px] font-black tracking-wider text-brand-live uppercase">
                      May.
                    </span>
                  )}
                  <span className="text-brand-charcoal/50"> ×{l.qty}</span>
                </span>
                <span className="shrink-0 font-bold text-brand-charcoal">
                  {formatARS(l.unitPrice * l.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t border-brand-charcoal/10 pt-3">
            <span className="text-[10px] font-black tracking-widest text-brand-charcoal/50 uppercase">
              Total
            </span>
            <span className="font-display text-2xl font-black text-brand-charcoal">
              {formatARS(subtotal)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || lines.length === 0}
          className="btn-premium flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-live px-6 py-4 text-xs font-black tracking-widest text-brand-charcoal uppercase transition-all hover:bg-brand-charcoal hover:text-brand-live disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon icon={faWhatsapp} className="h-4 w-4" />
          Confirmar por WhatsApp
        </button>
      </form>
    </Modal>
  );
}
