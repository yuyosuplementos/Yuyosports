/** Genera el SQL de seed de `settings` desde DEFAULT_SETTINGS. */
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_SETTINGS } from "../src/lib/constants";

const rows = Object.entries(DEFAULT_SETTINGS)
  .map(([k, v]) => `  ('${k}', '${JSON.stringify(v).replace(/'/g, "''")}'::jsonb)`)
  .join(",\n");

const sql = `insert into public.settings (key, value) values\n${rows}\non conflict (key) do update set value = excluded.value, updated_at = now();\n`;
fs.writeFileSync(path.join(__dirname, "seed-settings.sql"), sql);
console.log(sql);
