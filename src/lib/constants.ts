import type { SiteSettings } from "@/lib/schemas/settings";

export const SITE = {
  name: "YUYO SPORTS",
  tagline: "Suplementación Deportiva Premium",
  description:
    "Tienda oficial de suplementos deportivos YUYO SPORTS. Proteínas, Creatinas, Pre-entrenos y más. Venta por unidad y mayorista con envíos a todo el país.",
  locale: "es_AR",
} as const;

/**
 * Valores por defecto: lo que hoy esta hardcodeado en index.html.
 * Se usan como fallback si falta una fila en `settings`, para que la home
 * nunca renderice vacia.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  general: {
    heroLabel: "Suplementación de alto rendimiento",
    heroTitle: "Supera tu propio límite",
    heroDesc:
      "Suplementos originales, precios reales y asesoramiento de verdad. Envíos a todo el país.",
    heroImagePath: null,
  },
  promos: {
    lines: [
      { title: "ENVÍO GRATIS", detail: "En compras superiores a $85.000" },
      { title: "OFERTAS ESPECIALES", detail: "Hasta 30% OFF en productos seleccionados" },
      { title: "VENTA MAYORISTA", detail: "Precios especiales para revendedores" },
    ],
  },
  values: {
    items: [
      { title: "Envíos a todo el país", description: "Despachamos en 24/48 hs hábiles" },
      { title: "Productos originales", description: "Todas las marcas con garantía oficial" },
      { title: "Múltiples medios de pago", description: "Transferencia, Rapipago y Pago Fácil" },
      { title: "Asesoramiento real", description: "Te ayudamos a elegir por WhatsApp" },
    ],
  },
  banners: {
    retail: {
      title: "Comprá por unidad",
      description: "Todo el catálogo disponible, sin mínimo de compra.",
      buttonLabel: "Ver catálogo",
    },
    wholesale: {
      title: "Venta mayorista",
      description: "Precios por volumen para gimnasios, dietéticas y revendedores.",
      buttonLabel: "Consultar precios",
    },
  },
  offers: {
    label: "Ofertas",
    title: "Aprovechá los descuentos de la semana",
    description: "Productos seleccionados con precios rebajados por tiempo limitado.",
  },
  wholesale: {
    title: "Venta mayorista",
    description:
      "Trabajamos con gimnasios, dietéticas y revendedores de todo el país con precios diferenciales.",
    benefits: [
      "Precios por volumen",
      "Atención personalizada por WhatsApp",
      "Envíos a todo el país",
      "Reposición garantizada",
    ],
  },
  footer: {
    description:
      "Suplementación deportiva premium. Productos originales con garantía y envíos a todo el país.",
    phone: "+54 9 2262 53-5954",
    email: "ventas@yuyosports.com",
  },
  commerce: {
    whatsappPhone: "5492262535954",
    freeShippingThreshold: 85000,
    wholesaleMinimum: 300000,
  },
};

export const CART_STORAGE_KEY = "yuyo_sports_cart_v1";
export const PREFS_STORAGE_KEY = "yuyo_sports_prefs_v1";
