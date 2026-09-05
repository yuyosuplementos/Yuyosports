-- Extensiones base.
-- Fuera de `public`, que es un schema expuesto por PostgREST (linter 0014).
create schema if not exists extensions;

create extension if not exists pgcrypto with schema extensions;  -- gen_random_uuid()
create extension if not exists unaccent  with schema extensions; -- futura busqueda FTS sin acentos
