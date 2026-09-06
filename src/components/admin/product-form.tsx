"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@/components/ui/icon";
import { faFloppyDisk, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ImageUploader } from "./image-uploader";
import { toast } from "@/components/ui/toast";
import { saveProductAction } from "@/lib/actions/products";
import {
  productSchema,
  type ProductInput,
  type ProductFormValues,
} from "@/lib/schemas/product";
import { slugify } from "@/lib/utils/slugify";
import { cn } from "@/lib/utils/cn";
import type { Taxon } from "@/types/domain";
import type { AdminProduct } from "@/lib/data/admin";

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: AdminProduct;
  categories: Taxon[];
  brands: Taxon[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [flavorDraft, setFlavorDraft] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues, unknown, ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: product.category.id,
          brandId: product.brand.id,
          price: product.price,
          oldPrice: product.oldPrice,
          wholesalePrice: product.wholesalePrice,
          flavors: product.flavors,
          imagePath: product.imagePath,
          imageAlt: product.imageAlt,
          isOffer: product.isOffer,
          isOutOfStock: product.isOutOfStock,
          isPublished: product.isPublished,
          sortOrder: product.sortOrder,
        }
      : {
          name: "",
          slug: "",
          description: "",
          flavors: [],
          imagePath: null,
          imageAlt: null,
          isOffer: false,
          isOutOfStock: false,
          isPublished: true,
          sortOrder: 100,
        },
  });

  // useWatch en vez de watch(): la API memoizable, sin re-render de todo el form.
  const slug = useWatch({ control, name: "slug" }) ?? "";
  const flavors = useWatch({ control, name: "flavors" }) ?? [];

  function onSubmit(data: ProductInput) {
    startTransition(async () => {
      const res = await saveProductAction(data);
      if (!res.ok) return toast(res.error);
      toast(product ? "Producto actualizado" : "Producto creado");
      router.push("/admin/productos");
      router.refresh();
    });
  }

  function addFlavor() {
    const v = flavorDraft.trim();
    if (!v || flavors.includes(v)) return setFlavorDraft("");
    setValue("flavors", [...flavors, v], { shouldValidate: true });
    setFlavorDraft("");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-3xl flex-col gap-8">
      <Card title="Información básica">
        <Field label="Nombre" error={errors.name?.message}>
          <input
            {...register("name", {
              onChange: (e) => {
                // Autogenera el slug solo al crear: cambiarlo al editar
                // rompería la URL pública y el path de la imagen.
                if (!product) setValue("slug", slugify(e.target.value));
              },
            })}
            className={input(!!errors.name)}
            placeholder="Creatina Star Nutrition 500g"
          />
        </Field>

        <Field
          label="Slug (URL)"
          error={errors.slug?.message}
          hint={slug ? `/producto/${slug}` : undefined}
        >
          <input {...register("slug")} className={input(!!errors.slug)} />
        </Field>

        <Field label="Descripción" error={errors.description?.message}>
          <textarea {...register("description")} rows={3} className={input(!!errors.description)} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoría" error={errors.categoryId?.message}>
            <select {...register("categoryId")} className={input(!!errors.categoryId)}>
              <option value="">Elegir…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Marca" error={errors.brandId?.message}>
            <select {...register("brandId")} className={input(!!errors.brandId)}>
              <option value="">Elegir…</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Precios (ARS)">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Precio público" error={errors.price?.message}>
            <input type="number" min={0} {...register("price")} className={input(!!errors.price)} />
          </Field>
          <Field
            label="Precio anterior"
            error={errors.oldPrice?.message}
            hint="Se muestra tachado"
          >
            <input
              type="number"
              min={0}
              {...register("oldPrice", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
              className={input(!!errors.oldPrice)}
            />
          </Field>
          <Field label="Precio mayorista" error={errors.wholesalePrice?.message}>
            <input
              type="number"
              min={0}
              {...register("wholesalePrice")}
              className={input(!!errors.wholesalePrice)}
            />
          </Field>
        </div>
      </Card>

      <Card title="Imagen">
        <Controller
          control={control}
          name="imagePath"
          render={({ field }) => (
            <ImageUploader
              slug={slug ?? ""}
              value={field.value ?? null}
              onChange={field.onChange}
            />
          )}
        />
      </Card>

      <Card title="Sabores" hint="Dejalo vacío si el producto no tiene variantes.">
        <div className="flex flex-wrap gap-2">
          {flavors.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-2 rounded-full bg-brand-stone px-3 py-1.5 text-xs font-bold text-brand-charcoal"
            >
              {f}
              <button
                type="button"
                aria-label={`Quitar ${f}`}
                onClick={() =>
                  setValue(
                    "flavors",
                    flavors.filter((x) => x !== f),
                    { shouldValidate: true },
                  )
                }
                className="text-brand-charcoal/40 hover:text-red-600"
              >
                <Icon icon={faXmark} className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={flavorDraft}
            onChange={(e) => setFlavorDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFlavor();
              }
            }}
            placeholder="Vainilla"
            className={input(false)}
          />
          <button
            type="button"
            onClick={addFlavor}
            className="shrink-0 rounded-xl bg-brand-charcoal px-5 text-[11px] font-black tracking-widest text-brand-live uppercase"
          >
            Agregar
          </button>
        </div>
      </Card>

      <Card title="Configuración">
        <div className="flex flex-col gap-3">
          {(
            [
              ["isPublished", "Publicado (visible en la tienda)"],
              ["isOutOfStock", "Sin stock"],
              ["isOffer", "Destacar como oferta"],
            ] as const
          ).map(([name, label]) => (
            <label key={name} className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                {...register(name)}
                className="h-4 w-4 rounded accent-[#A4C629]"
              />
              {label}
            </label>
          ))}
        </div>
        <Field label="Orden" hint="Menor número aparece primero." error={errors.sortOrder?.message}>
          <input type="number" {...register("sortOrder")} className={input(!!errors.sortOrder)} />
        </Field>
      </Card>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-premium flex items-center gap-2 rounded-2xl bg-brand-live px-8 py-4 text-xs font-black tracking-widest text-brand-charcoal uppercase disabled:opacity-50"
        >
          <Icon icon={pending ? faSpinner : faFloppyDisk} className="h-3.5 w-3.5" spin={pending} />
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/productos")}
          className="btn-premium rounded-2xl border border-brand-charcoal/15 bg-white px-8 py-4 text-xs font-black tracking-widest text-brand-charcoal uppercase"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function input(hasError: boolean) {
  return cn(
    "w-full rounded-xl border-none px-4 py-3 text-sm font-medium text-brand-charcoal outline-none",
    hasError ? "bg-red-50 ring-2 ring-red-400" : "bg-brand-stone focus:ring-2 focus:ring-brand-live",
  );
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card">
      <div>
        <h2 className="text-[10px] font-black tracking-widest text-brand-charcoal/45 uppercase">
          {title}
        </h2>
        {hint && <p className="mt-1 text-xs text-brand-charcoal/40">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-black text-brand-charcoal/60">{label}</span>
      {children}
      {hint && !error && <span className="text-[11px] text-brand-charcoal/35">{hint}</span>}
      {error && <span className="text-[11px] font-bold text-red-600">{error}</span>}
    </label>
  );
}
