import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, "data/seed-raw.json"), "utf8"));

const slugify = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
   .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// Normalizacion de taxonomia: el seed viejo usaba 'Creatina' (singular)
// mientras el select del panel ofrecia 'Creatinas'. Afecta a 7 productos.
const CATEGORY_REMAP = { Creatina: "Creatinas", "Pre-Entreno": "Pre-Entrenos" };

const seen = new Set();
const out = raw.map((p, i) => {
  let slug = slugify(p.name);
  while (seen.has(slug)) slug = `${slug}-${i}`;
  seen.add(slug);
  const flavors = (p.flavors ?? []).filter((f) => f && f !== "Único" && f !== "Unico");
  return {
    slug,
    name: p.name,
    description: p.description ?? "",
    categoryName: CATEGORY_REMAP[p.category] ?? p.category,
    brandName: p.brand,
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    wholesalePrice: p.wholesalePrice,
    flavors,
    sourceImage: p.image,
    isGym: !!p.isGym,
    isOffer: !!p.isOffer,
    isOutOfStock: !!p.isOutOfStock,
    sortOrder: (i + 1) * 10,
  };
});

const body = out.map((p) => "  " + JSON.stringify(p) + ",").join("\n");
const file = `/**
 * Semilla del catalogo: los 40 productos extraidos de panel.html:948-989.
 *
 * Normalizaciones aplicadas respecto del original:
 *  - category 'Creatina' -> 'Creatinas' (7 productos); la FK ahora impide que
 *    vuelva a haber dos grafias de la misma categoria.
 *  - flavors: se elimina el centinela 'Unico'; sin variantes = array vacio.
 *  - oldPrice ausente -> null explicito.
 *  - slug derivado del nombre (sin acentos), tambien usado como nombre del
 *    objeto en Storage: resuelve espacios, acentos y los dos archivos con el
 *    nombre truncado ('ancakes...', 'ltraTech...').
 *
 * REVISAR LOS PRECIOS A MANO antes de correr el seed en produccion.
 */

export interface SeedProduct {
  slug: string;
  name: string;
  description: string;
  categoryName: string;
  brandName: string;
  price: number;
  oldPrice: number | null;
  wholesalePrice: number;
  flavors: string[];
  /** Ruta relativa al proyecto viejo; la consume migrate-images.ts */
  sourceImage: string;
  isGym: boolean;
  isOffer: boolean;
  isOutOfStock: boolean;
  sortOrder: number;
}

export const SEED_PRODUCTS: SeedProduct[] = [
${body}
];
`;

fs.writeFileSync(path.join(__dirname, "data/products.seed.ts"), file);
console.log("productos:", out.length);
console.log("slugs unicos:", new Set(out.map((p) => p.slug)).size);
console.log("categorias:", [...new Set(out.map((p) => p.categoryName))].sort().join(", "));
console.log("con sabores:", out.filter((p) => p.flavors.length).length, "| sin sabores:", out.filter((p) => !p.flavors.length).length);
console.log("wholesale > price:", out.filter((p) => p.wholesalePrice > p.price).length);
console.log("oldPrice <= price:", out.filter((p) => p.oldPrice !== null && p.oldPrice <= p.price).length);
