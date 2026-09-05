-- Taxonomia: categorias y marcas como tablas con FK.
-- Motivo: el sitio viejo guardaba category/brand como texto libre, y el seed
-- decia 'Creatina' mientras el select del panel decia 'Creatinas', asi que
-- filtrar por esa categoria devolvia 0 de 7 productos. La FK lo hace imposible.

create table public.categories (
  id         smallint generated always as identity primary key,
  slug       text     not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name       text     not null unique check (length(btrim(name)) between 2 and 40),
  sort_order smallint not null default 100,
  is_active  boolean  not null default true,
  created_at timestamptz not null default now()
);

create table public.brands (
  id         smallint generated always as identity primary key,
  slug       text     not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name       text     not null unique check (length(btrim(name)) between 2 and 40),
  is_active  boolean  not null default true,
  created_at timestamptz not null default now()
);

comment on table public.categories is 'Taxonomia de categorias. Editable desde /admin/taxonomia.';
comment on table public.brands     is 'Taxonomia de marcas. Editable desde /admin/taxonomia.';
