import { z } from "zod";

/**
 * Contenido editable del sitio.
 *
 * Reemplaza los 7 documentos `config/*` de Firestore. Se aprovecha el arranque
 * en limpio para darles nombres legibles: el panel viejo usaba `val1T`, `minB`,
 * `lbl`, `b[]`, y las promos codificaban titulo y subtitulo en un solo string
 * separado por "|". Nada dependia de esos nombres fuera del panel.
 */

const trimmed = z.string().trim();

export const generalSchema = z.object({
  heroLabel: trimmed.max(60).default(""),
  heroTitle: trimmed.max(160).default(""),
  heroDesc: trimmed.max(400).default(""),
  heroImagePath: trimmed.max(300).nullable().default(null),
  // Dimensiones reales del archivo. Se guardan para que el banner respete su
  // proporcion y el navegador reserve la altura exacta antes de descargarlo:
  // sin esto la pagina pega un salto cuando la imagen termina de cargar.
  heroImageWidth: z.number().int().positive().max(20000).nullable().default(null),
  heroImageHeight: z.number().int().positive().max(20000).nullable().default(null),
});

export const promosSchema = z.object({
  lines: z
    .array(
      z.object({
        title: trimmed.min(1).max(80),
        detail: trimmed.max(80).default(""),
      }),
    )
    .max(8)
    .default([]),
});

export const valuesSchema = z.object({
  items: z
    .array(z.object({ title: trimmed.max(40), description: trimmed.max(80) }))
    .length(4),
});

const bannerSide = z.object({
  title: trimmed.max(60),
  description: trimmed.max(200),
  buttonLabel: trimmed.max(30),
});

export const bannersSchema = z.object({
  retail: bannerSide,
  wholesale: bannerSide,
});

export const offersSchema = z.object({
  label: trimmed.max(40),
  title: trimmed.max(80),
  description: trimmed.max(240),
});

export const wholesaleSchema = z.object({
  title: trimmed.max(80),
  description: trimmed.max(400),
  benefits: z.array(trimmed.min(1).max(100)).max(8).default([]),
});

export const footerSchema = z.object({
  description: trimmed.max(300),
  phone: trimmed.max(40),
  email: z.string().trim().email().or(z.literal("")),
});

export const commerceSchema = z.object({
  /** Solo digitos, formato wa.me. Antes estaba hardcodeado en 5 lugares. */
  whatsappPhone: z
    .string()
    .trim()
    .regex(/^\d{8,15}$/, "Solo dígitos, con código de país. Ej: 5492262535954"),
  /** Ahora bloquea el checkout de verdad; antes era texto decorativo. */
  wholesaleMinimum: z.number().int().min(0),
});

export const settingsSchemas = {
  general: generalSchema,
  promos: promosSchema,
  values: valuesSchema,
  banners: bannersSchema,
  offers: offersSchema,
  wholesale: wholesaleSchema,
  footer: footerSchema,
  commerce: commerceSchema,
} as const;

export type SettingsKey = keyof typeof settingsSchemas;
export const SETTINGS_KEYS = Object.keys(settingsSchemas) as SettingsKey[];

export type GeneralSettings = z.infer<typeof generalSchema>;
export type PromosSettings = z.infer<typeof promosSchema>;
export type ValuesSettings = z.infer<typeof valuesSchema>;
export type BannersSettings = z.infer<typeof bannersSchema>;
export type OffersSettings = z.infer<typeof offersSchema>;
export type WholesaleSettings = z.infer<typeof wholesaleSchema>;
export type FooterSettings = z.infer<typeof footerSchema>;
export type CommerceSettings = z.infer<typeof commerceSchema>;

export interface SiteSettings {
  general: GeneralSettings;
  promos: PromosSettings;
  values: ValuesSettings;
  banners: BannersSettings;
  offers: OffersSettings;
  wholesale: WholesaleSettings;
  footer: FooterSettings;
  commerce: CommerceSettings;
}
