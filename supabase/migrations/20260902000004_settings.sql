-- Contenido editable del sitio. Clave/valor con JSONB + allowlist de claves.
-- Alternativa descartada: ~35 columnas de copy en una tabla de una fila, con
-- una migracion cada vez que el dueno quiera un beneficio mas.
-- La forma de cada value se valida con Zod en la Server Action que escribe.
create table public.settings (
  key        text primary key check (key in
               ('general','promos','values','banners','offers','wholesale','footer','commerce')),
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();
