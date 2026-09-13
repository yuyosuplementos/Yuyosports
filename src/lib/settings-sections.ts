import type { SettingsKey } from "@/lib/schemas/settings";

/**
 * Las 8 secciones de contenido editable, con su etiqueta para el panel.
 *
 * Vive en un módulo SIN "use client" a propósito: lo consumen tanto el
 * formulario (cliente) como el layout y la página de /admin/contenido
 * (servidor). Un Server Component que importa un valor desde un módulo
 * marcado "use client" no recibe el valor sino una referencia opaca al
 * cliente, y `SECTIONS.map` explota con "is not a function".
 */
export const SECTIONS: Array<{ key: SettingsKey; label: string; hint: string }> = [
  { key: "general", label: "Hero", hint: "El bloque principal de la home." },
  { key: "promos", label: "Barra de promos", hint: "El carrusel de arriba de todo." },
  { key: "values", label: "Beneficios", hint: "La franja de 4 ítems." },
  { key: "banners", label: "Banners", hint: "Las dos tarjetas minorista / mayorista." },
  { key: "offers", label: "Ofertas", hint: "El banner grande de ofertas." },
  { key: "wholesale", label: "Mayorista", hint: "El bloque B2B y sus beneficios." },
  { key: "footer", label: "Pie de página", hint: "Descripción y datos de contacto." },
  { key: "commerce", label: "Comercio", hint: "WhatsApp y mínimo mayorista." },
];
