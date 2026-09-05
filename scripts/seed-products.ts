/**
 * Inserta los 40 productos usando el image-manifest generado por migrate-images.
 *   npx tsx scripts/seed-products.ts
 * Idempotente: hace upsert por slug, asi que correrlo dos veces no duplica
 * (a diferencia de migrateInitialProducts() del panel viejo).
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { adminClientEnv } from "./_env";
import { SEED_PRODUCTS } from "./data/products.seed";

async function main() {
  const { url, key } = adminClientEnv();
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const manifestPath = path.resolve(process.cwd(), "scripts/image-manifest.json");
  const manifest: Record<string, string> = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : {};
  if (!Object.keys(manifest).length) {
    console.warn("  Sin image-manifest.json: los productos quedan sin imagen.");
    console.warn("  Corré antes: npx tsx scripts/migrate-images.ts\n");
  }

  const [{ data: cats }, { data: brands }] = await Promise.all([
    sb.from("categories").select("id, name"),
    sb.from("brands").select("id, name"),
  ]);
  const catId = new Map((cats ?? []).map((c) => [c.name, c.id]));
  const brandId = new Map((brands ?? []).map((b) => [b.name, b.id]));

  const rows = SEED_PRODUCTS.map((p) => {
    const cid = catId.get(p.categoryName);
    const bid = brandId.get(p.brandName);
    if (!cid) throw new Error(`Categoría inexistente: "${p.categoryName}" (¿corriste la migración 0007?)`);
    if (!bid) throw new Error(`Marca inexistente: "${p.brandName}"`);
    return {
      slug: p.slug,
      name: p.name,
      description: p.description,
      category_id: cid,
      brand_id: bid,
      price: p.price,
      old_price: p.oldPrice,
      wholesale_price: p.wholesalePrice,
      flavors: p.flavors,
      image_path: manifest[p.slug] ?? null,
      image_alt: p.name,
      is_gym: p.isGym,
      is_offer: p.isOffer,
      is_out_of_stock: p.isOutOfStock,
      is_published: true,
      sort_order: p.sortOrder,
    };
  });

  const { error, count } = await sb
    .from("products")
    .upsert(rows, { onConflict: "slug", count: "exact" });
  if (error) throw new Error(error.message);

  console.log(`  ${count ?? rows.length} productos insertados/actualizados.`);
  const sinImagen = rows.filter((r) => !r.image_path).length;
  if (sinImagen) console.log(`  ${sinImagen} sin imagen.`);
}

main().catch((e) => { console.error("\n ", e.message, "\n"); process.exit(1); });
