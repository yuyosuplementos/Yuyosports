"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { faSearch, faPen, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { toast } from "@/components/ui/toast";
import { toggleStockAction, deleteProductAction } from "@/lib/actions/products";
import { storagePublicUrl, PRODUCT_PLACEHOLDER } from "@/lib/utils/image";
import { formatARS } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { AdminProduct } from "@/lib/data/admin";

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  // Estado optimista del toggle de stock, por id.
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    // Null-safe, a diferencia del panel viejo: ahí un producto sin `name`
    // lanzaba TypeError y rompía el render de toda la tabla.
    return products.filter((p) =>
      `${p.name ?? ""} ${p.brand?.name ?? ""} ${p.category?.name ?? ""}`.toLowerCase().includes(q),
    );
  }, [products, query]);

  function handleToggle(p: AdminProduct) {
    const next = !(optimistic[p.id] ?? p.isOutOfStock);
    setOptimistic((s) => ({ ...s, [p.id]: next }));
    startTransition(async () => {
      const res = await toggleStockAction(p.id, next);
      if (!res.ok) {
        setOptimistic((s) => ({ ...s, [p.id]: !next }));
        toast(res.error);
      } else {
        toast(next ? "Marcado sin stock" : "Marcado con stock");
        router.refresh();
      }
    });
  }

  function handleDelete(p: AdminProduct) {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      const res = await deleteProductAction(p.id);
      toast(res.ok ? "Producto eliminado" : res.error);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon
            icon={faSearch}
            className="pointer-events-none absolute top-1/2 left-4 h-3.5 w-3.5 -translate-y-1/2 text-brand-charcoal/35"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, marca o categoría…"
            className="w-full rounded-xl border-none bg-white py-3 pr-4 pl-11 text-sm font-medium shadow-card outline-none focus:ring-2 focus:ring-brand-live"
          />
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="btn-premium flex items-center justify-center gap-2 rounded-xl bg-brand-live px-5 py-3 text-[11px] font-black tracking-widest text-brand-charcoal uppercase"
        >
          <Icon icon={faPlus} className="h-3 w-3" /> Agregar producto
        </Link>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white shadow-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-brand-charcoal/8 text-left">
              {["", "Producto", "Marca / Categoría", "Precios", "Estado", ""].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-4 text-[10px] font-black tracking-widest text-brand-charcoal/45 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-charcoal/5">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-brand-charcoal/45">
                  No se encontraron productos.
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const outOfStock = optimistic[p.id] ?? p.isOutOfStock;
              const src = storagePublicUrl(p.imagePath) ?? PRODUCT_PLACEHOLDER;
              return (
                <tr key={p.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-brand-stone">
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized={src.startsWith("data:")}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-brand-charcoal">{p.name}</p>
                    {!p.isPublished && (
                      <span className="text-[10px] font-black tracking-widest text-amber-600 uppercase">
                        Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[10px] font-black tracking-widest text-brand-moss uppercase">
                      {p.brand.name}
                    </p>
                    <p className="text-xs text-brand-charcoal/50">{p.category.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-brand-charcoal">{formatARS(p.price)}</p>
                    <p className="text-xs text-brand-charcoal/50">
                      May: {formatARS(p.wholesalePrice)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {p.isOffer && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-700 uppercase">
                          Oferta
                        </span>
                      )}
                      {p.isGym && (
                        <span className="rounded-full bg-brand-live/25 px-2 py-0.5 text-[10px] font-black text-brand-moss uppercase">
                          Gym
                        </span>
                      )}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={!outOfStock}
                        disabled={pending}
                        onClick={() => handleToggle(p)}
                        className={cn(
                          "relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50",
                          outOfStock ? "bg-brand-charcoal/20" : "bg-brand-live",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                            outOfStock ? "left-0.5" : "left-0.5 translate-x-4",
                          )}
                        />
                      </button>
                      <span className="text-[10px] font-bold text-brand-charcoal/45">
                        {outOfStock ? "Sin stock" : "En stock"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        aria-label={`Editar ${p.name}`}
                        className="rounded-lg p-2.5 text-brand-charcoal/50 transition-colors hover:bg-brand-stone hover:text-brand-charcoal"
                      >
                        <Icon icon={faPen} className="h-3 w-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        disabled={pending}
                        aria-label={`Eliminar ${p.name}`}
                        className="rounded-lg p-2.5 text-brand-charcoal/50 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Icon icon={faTrash} className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
