-- Extensiones base.
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists unaccent;   -- futura busqueda full-text sin acentos
