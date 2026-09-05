-- Trigger compartido de updated_at.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create table public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name            text not null check (length(btrim(name)) between 2 and 120),
  description     text not null default '' check (length(description) <= 600),

  category_id     smallint not null references public.categories(id) on delete restrict,
  brand_id        smallint not null references public.brands(id)     on delete restrict,

  -- Precios en pesos enteros. integer aguanta hasta $2.147.483.647.
  price           integer not null check (price > 0 and price < 100000000),
  old_price       integer          check (old_price is null or old_price > price),
  wholesale_price integer not null check (wholesale_price > 0),

  -- Sabor es solo una etiqueta que viaja al mensaje de WhatsApp:
  -- no hay stock, precio ni SKU por sabor, asi que no amerita tabla de variantes.
  -- Sin variantes = array vacio (se elimina el centinela 'Unico' del sitio viejo).
  flavors         text[] not null default '{}'::text[]
                    check (coalesce(array_length(flavors, 1), 0) <= 12
                           and array_position(flavors, null) is null
                           and not ('' = any(flavors))),

  image_path      text check (image_path is null or image_path ~ '^[a-z0-9/_.-]+$'),
  image_alt       text,

  is_gym          boolean not null default false,
  is_offer        boolean not null default false,
  is_out_of_stock boolean not null default false,
  is_published    boolean not null default true,

  sort_order      integer not null default 100,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint wholesale_lte_retail check (wholesale_price <= price)
);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- A 40 filas Postgres hace seq scan igual; estos indices son para cuando crezca.
create index products_category_idx on public.products (category_id) where is_published;
create index products_brand_idx    on public.products (brand_id)    where is_published;
create index products_offer_idx    on public.products (is_offer)    where is_published and is_offer;
create index products_order_idx    on public.products (sort_order, name);

-- A partir de ~300-500 productos, cambiar el filtrado en cliente por
-- paginacion server-side + FTS. El indice seria:
--   create index products_search_idx on public.products
--     using gin (to_tsvector('spanish', unaccent(name || ' ' || description)));

comment on column public.products.wholesale_price is
  'NOT NULL a proposito: en el sitio viejo un producto sin este campo rompia todo el render con un TypeError.';
