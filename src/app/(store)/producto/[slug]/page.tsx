import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts, getProductBySlug } from "@/lib/data/products";
import { BuyBox } from "@/components/store/buy-box";
import { storagePublicUrl, PRODUCT_PLACEHOLDER } from "@/lib/utils/image";
import { SITE } from "@/lib/constants";

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  const image = storagePublicUrl(p.imagePath);
  return {
    title: p.name,
    description: p.description || `${p.name} — ${p.brand.name}. ${SITE.tagline}.`,
    openGraph: {
      title: p.name,
      description: p.description,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const image = storagePublicUrl(product.imagePath);

  // JSON-LD: hace que Google muestre precio y disponibilidad en el resultado.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: image ? [image] : undefined,
    brand: { "@type": "Brand", name: product.brand.name },
    category: product.category.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: product.price,
      availability: product.isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <article className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Migas de pan" className="mb-6 flex flex-wrap gap-2 text-xs text-brand-charcoal/45">
        <Link href="/" className="hover:text-brand-moss">
          Inicio
        </Link>
        <span>/</span>
        <Link href={`/categoria/${product.category.slug}`} className="hover:text-brand-moss">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-brand-charcoal">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-brand-stone">
          <Image
            src={image ?? PRODUCT_PLACEHOLDER}
            alt={product.imageAlt ?? product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 512px"
            className="object-cover"
            unoptimized={!image}
          />
          {product.isOutOfStock && (
            <span className="absolute top-4 left-4 rounded-full bg-brand-charcoal px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase">
              Sin stock
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <Link
              href={`/marca/${product.brand.slug}`}
              className="text-[10px] font-black tracking-widest text-brand-moss uppercase hover:underline"
            >
              {product.brand.name}
            </Link>
            <h1 className="font-display mt-2 text-3xl font-black tracking-tight text-brand-charcoal">
              {product.name}
            </h1>
          </div>

          {product.description && (
            <p className="text-sm leading-relaxed text-brand-charcoal/60">{product.description}</p>
          )}

          <BuyBox product={product} />
        </div>
      </div>
    </article>
  );
}
