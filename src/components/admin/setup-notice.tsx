/** Pantalla de configuración: reemplaza al error de runtime cuando falta el .env.local. */
export function SetupNotice() {
  const steps = [
    "Creá el proyecto en supabase.com con la cuenta del dueño del negocio.",
    "Copiá .env.example a .env.local y completá las tres claves de Project Settings → API.",
    "Ejecutá en orden los archivos de supabase/migrations/ en el SQL Editor.",
    "Corré: npm run seed:images && npm run seed:products && npm run seed:settings",
    "Creá el admin: npm run create:admin (con ADMIN_EMAIL y ADMIN_PASSWORD en .env.local).",
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-charcoal p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-soft-lg">
        <p className="font-display text-lg font-black tracking-widest uppercase">
          <span className="text-brand-live">YUYO</span>{" "}
          <span className="text-brand-charcoal">SPORTS</span>
        </p>
        <h1 className="font-display mt-4 text-xl font-black text-brand-charcoal">
          Falta conectar Supabase
        </h1>
        <p className="mt-2 text-sm text-brand-charcoal/55">
          El panel necesita la base de datos. Seguí estos pasos (están detallados en el README):
        </p>
        <ol className="mt-5 flex flex-col gap-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-brand-charcoal/70">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-live text-xs font-black text-brand-charcoal">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
