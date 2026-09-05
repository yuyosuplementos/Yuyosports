/**
 * Inserta las 8 filas de `settings` con los valores por defecto
 * (lo que hoy esta hardcodeado en index.html).
 *   npx tsx scripts/seed-settings.ts
 * Usa upsert, asi que no pisa cambios hechos desde el panel salvo que se fuerce.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { adminClientEnv } from "./_env";
import { DEFAULT_SETTINGS } from "../src/lib/constants";

const FORCE = process.argv.includes("--force");

async function main() {
  const { url, key } = adminClientEnv();
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const settings = structuredClone(DEFAULT_SETTINGS);

  // Si ya se corrio migrate-images, apuntar el hero a la imagen subida.
  const manifestPath = path.resolve(process.cwd(), "scripts/image-manifest.json");
  if (fs.existsSync(manifestPath)) {
    const m: Record<string, string> = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const hero = m["__hero.png"] ?? m["__hero2.jpg"];
    if (hero) settings.general.heroImagePath = hero;
  }

  if (!FORCE) {
    const { data: existing } = await sb.from("settings").select("key");
    const have = new Set((existing ?? []).map((r) => r.key));
    if (have.size) console.log(`  Ya existen: ${[...have].join(", ")} (usá --force para pisarlas)`);
    for (const k of have) delete (settings as unknown as Record<string, unknown>)[k];
  }

  const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
  if (!rows.length) return console.log("  Nada que insertar.");

  const { error } = await sb.from("settings").upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
  console.log(`  ${rows.length} secciones de contenido cargadas: ${rows.map((r) => r.key).join(", ")}`);
}

main().catch((e) => { console.error("\n ", e.message, "\n"); process.exit(1); });
