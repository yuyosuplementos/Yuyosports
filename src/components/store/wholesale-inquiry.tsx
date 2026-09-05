"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/overlay";
import { toast } from "@/components/ui/toast";
import { buildWholesaleInquiry, waLink } from "@/lib/utils/whatsapp";

const schema = z.object({
  name: z.string().trim().min(2, "Ingresá el nombre del comercio"),
  phone: z.string().trim().min(6, "Ingresá un teléfono"),
  location: z.string().trim().min(2, "Ingresá tu localidad"),
});
type Input = z.infer<typeof schema>;

/**
 * El modal de consulta mayorista existía en el DOM del sitio viejo pero era
 * inalcanzable: openMayoristaModal() no tenía ningún caller. Acá se cablea.
 */
export function WholesaleInquiryButton({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Input>({ resolver: zodResolver(schema) });

  function onSubmit(data: Input) {
    const msg = buildWholesaleInquiry(data.name, data.phone, data.location);
    window.open(waLink(phone, msg), "_blank", "noopener,noreferrer");
    reset();
    setOpen(false);
    toast("Consulta enviada por WhatsApp");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-premium inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-live px-6 py-4 text-xs font-black tracking-widest text-brand-charcoal uppercase transition-all hover:bg-brand-charcoal hover:text-brand-live"
      >
        Pedir lista de precios
      </button>

      <Modal open={open} onClose={() => setOpen(false)} labelledBy="ws-title">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="ws-title" className="font-display text-xl font-black text-brand-charcoal">
                Lista mayorista
              </h2>
              <p className="mt-1 text-xs text-brand-charcoal/50">
                Dejanos tus datos y te pasamos precios por volumen.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="rounded-full p-2 text-brand-charcoal/40 transition-colors hover:bg-brand-stone hover:text-brand-charcoal"
            >
              <Icon icon={faXmark} className="h-4 w-4" />
            </button>
          </div>

          {(
            [
              ["name", "Comercio o gimnasio", "Suplementos Don Juan"],
              ["phone", "Teléfono / WhatsApp", "11 3456 7890"],
              ["location", "Provincia / Localidad", "Mar del Plata, BA"],
            ] as const
          ).map(([field, label, placeholder]) => (
            <label key={field} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black tracking-widest text-brand-charcoal/50 uppercase">
                {label}
              </span>
              <input
                {...register(field)}
                placeholder={placeholder}
                className="w-full rounded-xl border-none bg-brand-stone px-4 py-3 text-sm font-medium text-brand-charcoal outline-none focus:ring-2 focus:ring-brand-live"
              />
              {errors[field] && (
                <span className="text-[11px] font-bold text-red-600">{errors[field]?.message}</span>
              )}
            </label>
          ))}

          <button
            type="submit"
            className="btn-premium flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-live px-6 py-4 text-xs font-black tracking-widest text-brand-charcoal uppercase transition-all hover:bg-brand-charcoal hover:text-brand-live"
          >
            <Icon icon={faWhatsapp} className="h-4 w-4" /> Enviar por WhatsApp
          </button>
        </form>
      </Modal>
    </>
  );
}
