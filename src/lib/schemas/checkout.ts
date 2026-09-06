import { z } from "zod";

/**
 * El checkout pide SOLO el nombre.
 *
 * El resto (teléfono, dirección, forma de pago y envío) se acuerda por
 * WhatsApp, que es donde de todos modos se cierra la venta: pedirlo dos veces
 * agrega fricción y datos personales que no necesitamos guardar.
 */
export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre").max(80),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
