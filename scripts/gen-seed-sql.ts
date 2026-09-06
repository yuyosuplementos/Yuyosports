/** Genera el SQL de seed de productos (se aplica vía MCP o SQL Editor). */
import fs from "node:fs";
import path from "node:path";
import { SEED_PRODUCTS } from "./data/products.seed";

const q = (v: string | null) => (v === null ? "null" : `'${v.replace(/'/g, "''")}'`);
const arr = (a: string[]) => (a.length ? `array[${a.map((x) => q(x)).join(",")}]::text[]` : `'{}'::text[]`);

const values = SEED_PRODUCTS.map(
  (p) =>
    `  (${q(p.slug)}, ${q(p.name)}, ${q(p.description)}, ${q(p.categoryName)}, ${q(p.brandName)}, ` +
    `${p.price}, ${p.oldPrice === null ? "null::integer" : p.oldPrice}, ${p.wholesalePrice}, ` +
    `${arr(p.flavors)}, ${q("products/" + p.slug + ".webp")}, ` +
    `${p.isOffer}, ${p.isOutOfStock}, ${p.sortOrder})`,
).join(",\n");

const sql = `insert into public.products (
  slug, name, description, category_id, brand_id,
  price, old_price, wholesale_price, flavors, image_path, image_alt,
  is_offer, is_out_of_stock, is_published, sort_order
)
select v.slug, v.name, v.description, c.id, b.id,
       v.price, v.old_price, v.wholesale_price, v.flavors, v.image_path, v.name,
       v.is_offer, v.is_out_of_stock, true, v.sort_order
from (values
${values}
) as v(slug, name, description, category_name, brand_name,
       price, old_price, wholesale_price, flavors, image_path,
       is_offer, is_out_of_stock, sort_order)
join public.categories c on c.name = v.category_name
join public.brands     b on b.name = v.brand_name
on conflict (slug) do update set
  name = excluded.name, description = excluded.description,
  category_id = excluded.category_id, brand_id = excluded.brand_id,
  price = excluded.price, old_price = excluded.old_price,
  wholesale_price = excluded.wholesale_price, flavors = excluded.flavors,
  image_path = excluded.image_path, image_alt = excluded.image_alt,
  is_offer = excluded.is_offer,
  is_out_of_stock = excluded.is_out_of_stock, sort_order = excluded.sort_order;
`;

fs.writeFileSync(path.join(__dirname, "seed-products.sql"), sql);
console.log("productos:", SEED_PRODUCTS.length, "| bytes:", sql.length);
