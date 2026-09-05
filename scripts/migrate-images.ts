/**
 * Migracion one-shot de las imagenes del sitio viejo al bucket `media`.
 *
 *   npx tsx scripts/migrate-images.ts --dry-run     # procesa y reporta, no sube
 *   npx tsx scripts/migrate-images.ts               # procesa y sube
 *   npx tsx scripts/migrate-images.ts --only=<slug>
 *
 * El nombre destino se deriva del SLUG del producto, no del archivo fuente:
 * eso resuelve de una los espacios, los acentos y los dos archivos con el
 * nombre truncado ('ancakes Proteicos...', 'ltraTech Pudding...').
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { adminClientEnv } from "./_env";
import { SEED_PRODUCTS } from "./data/products.seed";

const LEGACY_ROOT = path.resolve(process.cwd(), "..");
const OUT_DIR = path.resolve(process.cwd(), "scripts/.out");
const MANIFEST = path.resolve(process.cwd(), "scripts/image-manifest.json");

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const ONLY = args.find((a) => a.startsWith("--only="))?.split("=")[1];

/** Archivos cuyo nombre en el seed no coincide con el del disco. */
const FILENAME_FIXUPS: Record<string, string> = {
  // Los dos truncados existen en disco CON el nombre truncado, asi que el
  // path del seed resuelve bien. Se dejan documentados por si se renombran.
};

function resolveSource(rel: string): string | null {
  const direct = path.join(LEGACY_ROOT, FILENAME_FIXUPS[rel] ?? rel);
  if (fs.existsSync(direct)) return direct;

  // Fallback difuso: mismo nombre ignorando acentos, mayusculas y el primer caracter.
  const dir = path.join(LEGACY_ROOT, "img");
  if (!fs.existsSync(dir)) return null;
  const target = path.basename(rel).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const found = fs.readdirSync(dir).find((f) => {
    const n = f.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return n === target || n.endsWith(target) || target.endsWith(n.slice(1));
  });
  return found ? path.join(dir, found) : null;
}

async function main() {
  const items = SEED_PRODUCTS.filter((p) => !ONLY || p.slug === ONLY);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const sb = DRY
    ? null
    : (() => {
        const { url, key } = adminClientEnv();
        return createClient(url, key, { auth: { persistSession: false } });
      })();

  const manifest: Record<string, string> = {};
  const missing: string[] = [];
  let beforeTotal = 0;
  let afterTotal = 0;

  console.log(`\n${DRY ? "[DRY RUN] " : ""}Procesando ${items.length} imágenes...\n`);
  console.log("  origen".padEnd(52) + "→ destino".padEnd(46) + "   antes →  después");
  console.log("  " + "-".repeat(116));

  for (const p of items) {
    const src = resolveSource(p.sourceImage);
    if (!src) {
      missing.push(`${p.slug}  (${p.sourceImage})`);
      continue;
    }

    const before = fs.statSync(src).size;
    const buf = await sharp(src)
      .rotate() // respeta la orientacion EXIF antes de descartarla
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toBuffer();

    const dest = `products/${p.slug}.webp`;
    beforeTotal += before;
    afterTotal += buf.byteLength;

    if (DRY) {
      fs.writeFileSync(path.join(OUT_DIR, `${p.slug}.webp`), buf);
    } else {
      const { error } = await sb!.storage.from("media").upload(dest, buf, {
        contentType: "image/webp",
        upsert: true,
        cacheControl: "31536000", // 1 año: el path es inmutable
      });
      if (error) throw new Error(`upload ${dest}: ${error.message}`);
    }

    manifest[p.slug] = dest;
    const kb = (n: number) => (n / 1024).toFixed(0).padStart(5) + " KB";
    console.log(
      "  " + path.basename(src).slice(0, 48).padEnd(50) +
      "→ " + dest.slice(0, 42).padEnd(44) + kb(before) + " → " + kb(buf.byteLength),
    );
  }

  // Imagenes de contenido (hero)
  for (const [rel, dest] of [
    ["hero.png", `settings/hero-${Date.now()}.webp`],
    ["img/hero2.jpg", `settings/banner-${Date.now()}.webp`],
  ] as const) {
    const src = path.join(LEGACY_ROOT, rel);
    if (!fs.existsSync(src)) continue;
    const before = fs.statSync(src).size;
    const buf = await sharp(src)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toBuffer();
    beforeTotal += before;
    afterTotal += buf.byteLength;
    if (DRY) fs.writeFileSync(path.join(OUT_DIR, path.basename(dest)), buf);
    else {
      const { error } = await sb!.storage.from("media").upload(dest, buf, {
        contentType: "image/webp", upsert: true, cacheControl: "31536000",
      });
      if (error) throw new Error(`upload ${dest}: ${error.message}`);
    }
    manifest[`__${path.basename(rel)}`] = dest;
    console.log("  " + rel.padEnd(50) + "→ " + dest.padEnd(44) +
      (before / 1024).toFixed(0).padStart(5) + " KB → " + (buf.byteLength / 1024).toFixed(0).padStart(5) + " KB");
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

  const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
  console.log("\n  " + "-".repeat(116));
  console.log(`  Total: ${mb(beforeTotal)} MB → ${mb(afterTotal)} MB  (${(100 - (afterTotal / beforeTotal) * 100).toFixed(0)}% menos)`);
  console.log(`  Manifest: scripts/image-manifest.json (${Object.keys(manifest).length} entradas)`);
  if (missing.length) {
    console.log(`\n  NO RESUELTAS (${missing.length}):`);
    missing.forEach((m) => console.log("   - " + m));
  }
  if (DRY) console.log(`\n  [DRY RUN] Los .webp quedaron en scripts/.out/ para inspección. No se subió nada.\n`);
  else console.log(`\n  Subidas OK al bucket 'media'.\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
