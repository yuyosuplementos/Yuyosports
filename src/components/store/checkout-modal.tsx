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
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: commerce.paymentMethods[0] ?? "",
      shippingMethod: commerce.shippingMethods[0] ?? "",
    },
  });

  function onSubmit(data: CheckoutInput) {
    const message = buildOrderMessage(data, lines);
    // Mismo comportamiento que el sitio viejo: abre WhatsApp con el pedido.
    // No se persiste la orden (decisión 2).
    window.open(waLink(commerce.whatsappPhone, message), "_blank", "noopener,noreferrer");
    clear();
    reset();
    toast("¡Pedido generado! Abriendo WhatsApp…");
    onDone();
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="checkout-title" className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="checkout-title" className="font-display text-xl font-black text-brand-charcoal">
              Finalizar compra
            </h2>
            <p className="mt-1 text-xs text-brand-charcoal/50">
              Completá tus datos y cerramos el pedido por WhatsApp.
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" error={errors.name?.message}>
            <input {...register("name")} placeholder="Juan" className={inputCls(!!errors.name)} />
          </Field>
          <Field label="Apellido" error={errors.lastName?.message}>
            <input
              {...register("lastName")}
              placeholder="Pérez"
              className={inputCls(!!errors.lastName)}
            />
          </Field>
          <Field label="WhatsApp" error={errors.phone?.message}>
            <input
              {...register("phone")}
              type="tel"
              placeholder="11 3456 7890"
              className={inputCls(!!errors.phone)}
            />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              placeholder="tu@email.com"
              className={inputCls(!!errors.email)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Dirección de entrega" error={errors.address?.message}>
              <input
                {...register("address")}
                placeholder="Calle y número / Piso"
                className={inputCls(!!errors.address)}
              />
            </Field>
          </div>
          <Field label="Ciudad" error={errors.city?.message}>
            <input {...register("city")} placeholder="CABA" className={inputCls(!!errors.city)} />
          </Field>
          <Field label="Método de pago">
            <select {...register("paymentMethod")} className={inputCls(false)}>
              {commerce.paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Método de envío">
              <select {...register("shippingMethod")} className={inputCls(false)}>
                {commerce.shippingMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="flex items-baseline justify-between rounded-2xl bg-brand-stone px-5 py-4">
          <span className="text-[10px] font-black tracking-widest text-brand-charcoal/50 uppercase">
            Total del pedido
          </span>
          <span className="font-display text-2xl font-black text-brand-charcoal">
            {formatARS(subtotal)}
          </span>
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

function inputCls(hasError: boolean) {
  return cn(
    "w-full rounded-xl border-none px-4 py-3 text-sm font-medium text-brand-charcoal outline-none transition-shadow",
    hasError ? "bg-red-50 ring-2 ring-red-400" : "bg-brand-stone focus:ring-2 focus:ring-brand-live",
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-black tracking-widest text-brand-charcoal/50 uppercase">
        {label}
      </span>
      {children}
      {error && <span className="text-[11px] font-bold text-red-600">{error}</span>}
    </label>
  );
}
