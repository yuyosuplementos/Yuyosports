import { z } from "zod";

/** Mismos campos y mismas validaciones que el checkout viejo, ahora tipadas. */
export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre").max(60),
  lastName: z.string().trim().min(2, "Ingresá tu apellido").max(60),
  phone: z
    .string()
    .trim()
    .min(6, "Ingresá tu WhatsApp")
    .max(30)
    .regex(/^[\d\s()+-]+$/, "Solo números, espacios y + ( ) -"),
  email: z.string().trim().email("Email inválido"),
  address: z.string().trim().min(4, "Ingresá tu dirección").max(140),
  city: z.string().trim().min(2, "Ingresá tu ciudad").max(80),
  paymentMethod: z.string().min(1),
  shippingMethod: z.string().min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
