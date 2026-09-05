-- Taxonomia canonica. Regla: contables en plural, incontables en singular.
-- 'Creatina' del seed viejo se normaliza a 'Creatinas' (afecta 7 productos).
insert into public.categories (slug, name, sort_order) values
  ('proteinas',     'Proteínas',     10),
  ('creatinas',     'Creatinas',     20),
  ('pre-entrenos',  'Pre-Entrenos',  30),
  ('aminoacidos',   'Aminoácidos',   40),
  ('quemadores',    'Quemadores',    50),
  ('ganadores',     'Ganadores',     60),
  ('vitaminas',     'Vitaminas',     70),
  ('minerales',     'Minerales',     80),
  ('colageno',      'Colágeno',      90),
  ('energia',       'Energía',      100),
  ('snacks',        'Snacks',       110),
  ('accesorios',    'Accesorios',   120),
  ('indumentaria',  'Indumentaria', 130)
on conflict (slug) do nothing;

insert into public.brands (slug, name) values
  ('star-nutrition', 'Star Nutrition'),
  ('ena',            'ENA'),
  ('granger',        'Granger'),
  ('one-fit',        'One Fit'),
  ('gold',           'Gold'),
  ('x-body',         'X-BODY'),
  ('gomex',          'GOMEX'),
  ('gentech',        'Gentech'),
  ('pont',           'Pont'),
  ('nutremax',       'Nutremax'),
  ('mole',           'MOLE'),
  ('mrs-taste',      'Mrs Taste'),
  ('ultratech',      'UltraTech')
on conflict (slug) do nothing;
