-- Admin como tabla, no como custom claim en el JWT.
-- Motivo: un claim ya emitido sigue siendo valido hasta que expira (hasta 1h).
-- Con tabla, revocar el acceso es un DELETE con efecto en la proxima query.
create table public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins a where a.user_id = auth.uid()) $$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.products   enable row level security;
alter table public.categories enable row level security;
alter table public.brands     enable row level security;
alter table public.settings   enable row level security;
alter table public.admins     enable row level security;

-- ---------- LECTURA PUBLICA ----------
create policy products_public_read on public.products
  for select to anon, authenticated using (is_published);
create policy categories_public_read on public.categories
  for select to anon, authenticated using (is_active);
create policy brands_public_read on public.brands
  for select to anon, authenticated using (is_active);
create policy settings_public_read on public.settings
  for select to anon, authenticated using (true);

-- ---------- ESCRITURA SOLO ADMIN ----------
-- OJO: `(select public.is_admin())` y no `public.is_admin()` a secas.
-- El parentesis lo convierte en InitPlan: Postgres lo evalua UNA vez por query
-- en lugar de una vez por fila. Es el patron de performance recomendado en RLS.
create policy products_admin_all on public.products
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy categories_admin_all on public.categories
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy brands_admin_all on public.brands
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy settings_admin_write on public.settings
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Cada admin ve solo su propia fila. Nadie inserta desde la app:
-- el admin inicial se crea con scripts/create-admin.ts (service_role).
create policy admins_self_read on public.admins
  for select to authenticated using (user_id = (select auth.uid()));
