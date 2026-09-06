/**
 * Paridad de filtros contra el sitio viejo, usando el seed real.
 *   npx tsx scripts/test/filters-parity.ts
 */
import assert from "node:assert/strict";
import { applyFilters, EMPTY_FILTERS, type Filters } from "../../src/components/store/catalog/use-filters";
import { slugify } from "../../src/lib/utils/slugify";
import { SEED_PRODUCTS } from "../data/products.seed";
import type { Product } from "../../src/types/domain";

const catId = new Map<string, number>();
const brandId = new Map<string, number>();
const products: Product[] = SEED_PRODUCTS.map((p, i) => {
  if (!catId.has(p.categoryName)) catId.set(p.categoryName, catId.size + 1);
  if (!brandId.has(p.brandName)) brandId.set(p.brandName, brandId.size + 1);
  return {
    id: String(i), slug: p.slug, name: p.name, description: p.description,
    category: { id: catId.get(p.categoryName)!, slug: slugify(p.categoryName), name: p.categoryName },
    brand: { id: brandId.get(p.brandName)!, slug: slugify(p.brandName), name: p.brandName },
    price: p.price, oldPrice: p.oldPrice, wholesalePrice: p.wholesalePrice,
    flavors: p.flavors, imagePath: null, imageAlt: null,
    isOffer: p.isOffer, isOutOfStock: p.isOutOfStock, sortOrder: p.sortOrder,
  };
});

const f = (o: Partial<Filters>): Filters => ({ ...EMPTY_FILTERS, ...o });
const n = (o: Partial<Filters>) => applyFilters(products, f(o)).length;

const cases: Array<[string, number, number]> = [
  ["sin filtros",                         n({}),                                              40],
  ["categoría Creatinas",                 n({ category: "creatinas" }),                        7],
  ["categoría Snacks",                    n({ category: "snacks" }),                          11],
  ["categoría Vitaminas",                 n({ category: "vitaminas" }),                        7],
  ["marca Star Nutrition",                n({ brand: "star-nutrition" }),                     11],
  ["marca Granger",                       n({ brand: "granger" }),                             8],
  ["marca One Fit",                       n({ brand: "one-fit" }),                             7],
  ["solo ofertas",                        n({ saleOnly: true }),                              12],
  ["Creatinas + Star Nutrition",          n({ category: "creatinas", brand: "star-nutrition" }), 2],
  ["buscar 'magnesio'",                   n({ search: "magnesio" }),                           4],
  ["buscar 'prote'",                      n({ search: "prote" }),                             10],
  ["buscar 'PROTE' (case-insensitive)",   n({ search: "PROTE" }),                             10],
  ["ofertas + Star Nutrition",            n({ saleOnly: true, brand: "star-nutrition" }),      4],
  ["combinación sin resultados",          n({ category: "snacks", brand: "one-fit" }),         0],
];

let failed = 0;
for (const [label, got, want] of cases) {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`  ${ok ? "OK  " : "FALLA"}  ${label.padEnd(36)} ${got} (esperado ${want})`);
}

console.log();
assert.equal(failed, 0, `${failed} caso(s) no coinciden`);
console.log("Todos los conteos coinciden.");
console.log("Nota: 'Creatinas' devuelve 7. En el sitio viejo devolvía 0, porque");
console.log("el seed decía 'Creatina' y el select del panel decía 'Creatinas'.");
