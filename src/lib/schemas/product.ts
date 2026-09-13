import { z } from "zod";

const money = z.coerce.number().int().positive().max(99_999_999);

export const productSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(2, "Mínimo 2 caracteres").max(120),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones")
      .max(80),
    description: z.string().trim().max(600).default(""),
    categoryId: z.coerce.number().int().positive({ message: "Elegí una categoría" }),
    brandId: z.coerce.number().int().positive({ message: "Elegí una marca" }),
    price: money,
    oldPrice: z.coerce.number().int().positive().max(99_999_999).nullable().optional(),
    wholesalePrice: money,
    flavors: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
    imagePath: z.string().trim().max(300).nullable().default(null),
    imageAlt: z.string().trim().max(160).nullable().default(null),
    isOffer: z.boolean().default(false),
    isOutOfStock: z.boolean().default(false),
    isPublished: z.boolean().default(true),
    sortOrder: z.coerce.number().int().min(0).max(100000).default(100),
  })
  // Mismos CHECK que la base, para dar el error en el formulario y no un 500.
  .refine((d) => d.wholesalePrice <= d.price, {
    message: "El precio mayorista no puede superar al minorista",
    path: ["wholesalePrice"],
  });

/**
 * z.coerce hace que el tipo de ENTRADA del schema (lo que tipea el usuario en
 * el form) difiera del de SALIDA (lo ya coercionado). react-hook-form necesita
 * ambos: TFieldValues = input, TTransformedValues = output.
 */
export type ProductFormValues = z.input<typeof productSchema>;
export type ProductInput = z.output<typeof productSchema>;
