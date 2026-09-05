import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), ".env.local") });

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`\n  Falta ${name} en .env.local (copiá .env.example).\n`);
    process.exit(1);
  }
  return v;
}

export function adminClientEnv() {
  return { url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"), key: requireEnv("SUPABASE_SERVICE_ROLE_KEY") };
}
