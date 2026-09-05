-- Bucket unico para imagenes de producto y de contenido.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880,
        array['image/webp','image/jpeg','image/png','image/avif'])
on conflict (id) do nothing;

create policy "media_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');
create policy "media_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and (select public.is_admin()));
create policy "media_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select public.is_admin()));

-- Las 4 metricas del dashboard en una query en vez de cuatro.
-- security_invoker: respeta la RLS del que consulta, no la del creador.
create view public.admin_product_stats
with (security_invoker = on) as
select count(*)::int                                as total,
       count(*) filter (where is_out_of_stock)::int as out_of_stock,
       count(*) filter (where is_offer)::int        as on_offer,
       count(*) filter (where is_gym)::int          as gym_line
from public.products;
