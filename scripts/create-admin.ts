/**
 * Crea el usuario admin inicial y su fila en `admins`.
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/create-admin.ts
 *
 * Requiere service_role. Es el unico camino para darle acceso al panel:
 * la tabla `admins` no tiene policy de INSERT, asi que nadie puede
 * auto-promoverse desde la app.
 */
import { createClient } from "@supabase/supabase-js";
import { adminClientEnv, requireEnv } from "./_env";

async function main() {
  const { url, key } = adminClientEnv();
  const email = requireEnv("ADMIN_EMAIL");
  const password = requireEnv("ADMIN_PASSWORD");
  if (password.length < 12) {
    console.error("  Usá una contraseña de al menos 12 caracteres.");
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });

  let userId: string | undefined;
  const { data: created, error: createErr } = await sb.auth.admin.createUser({
    email, password, email_confirm: true,
  });

  if (createErr) {
    if (!/already/i.test(createErr.message)) throw new Error(createErr.message);
    const { data: list } = await sb.auth.admin.listUsers();
    userId = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
    if (!userId) throw new Error(`El usuario ${email} existe pero no se pudo recuperar.`);
    console.log("  El usuario ya existía; solo se asegura la fila en admins.");
  } else {
    userId = created.user!.id;
    console.log(`  Usuario creado: ${email}`);
  }

  const { error } = await sb.from("admins").upsert({ user_id: userId, email }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);

  console.log(`  ${email} es admin. Entrá en /admin/login\n`);
  console.log("  Recordá cerrar los signups públicos:");
  console.log("  Supabase → Authentication → Sign In / Providers → Allow new users to sign up: OFF\n");
}

main().catch((e) => { console.error("\n ", e.message, "\n"); process.exit(1); });
