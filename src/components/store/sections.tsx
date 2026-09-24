import Image from "next/image";
import Link from "next/link";
import {
  faTruck,
  faShieldHalved,
  faCreditCard,
  faHeadset,
  faCheck,
  faArrowRight,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { WholesaleInquiryButton } from "@/components/store/wholesale-inquiry";
import { storagePublicUrl, PRODUCT_PLACEHOLDER } from "@/lib/utils/image";
import { waLink } from "@/lib/utils/whatsapp";
import type { Product, Taxon } from "@/types/domain";
import type {
  GeneralSettings,
  ValuesSettings,
  BannersSettings,
  OffersSettings,
  WholesaleSettings,
  CommerceSettings,
} from "@/lib/schemas/settings";

/* ---------------------------------------------------------------- Hero --- */

export function HeroBanner({ general }: { general: GeneralSettings }) {
  const src = storagePublicUrl(general.heroImagePath);
  if (!src) return null;

  const { heroImageWidth: width, heroImageHeight: height } = general;

  // Con las dimensiones reales el banner se ve completo, en su proporcion,
  // y el navegador reserva la altura exacta antes de descargarlo.
  if (width && height) {
    return (
      <div className="w-full bg-brand-stone">
        <Image
          src={src}
          alt=""
          width={width}
          height={height}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
      </div>
    );
  }

  // Banners cargados antes de que guardaramos las dimensiones: se mantiene
  // el recorte a proporcion fija hasta que se vuelva a subir la imagen.
  return (
    <div className="relative aspect-[21/9] w-full bg-brand-stone md:aspect-[3/1]">
      <Image src={src} alt="" fill priority sizes="100vw" className="object-cover" />
    </div>
  );
}

export function Hero({ general, featured }: { general: GeneralSettings; featured: Product | null }) {
  return (
    <section id="hero" className="bg-brand-charcoal text-white">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 md:px-8 lg:grid-cols-2 lg:py-24">
        <div className="reveal active">
          {general.heroLabel && (
            <span className="text-[10px] font-black tracking-widest text-brand-live uppercase">
              {general.heroLabel}
            </span>
          )}
          <h1 className="font-display mt-4 text-4xl leading-[1.05] font-black tracking-tight md:text-6xl">
            {general.heroTitle}
          </h1>
          {general.heroDesc && (
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/50">
              {general.heroDesc}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/#catalog" size="lg">
              Ver catálogo <Icon icon={faArrowRight} className="h-3 w-3" />
            </ButtonLink>
            <ButtonLink
              href="/ofertas"
              size="lg"
              className="border border-white/15 bg-transparent text-white hover:bg-white hover:text-brand-charcoal"
            >
              <Icon icon={faBolt} className="h-3 w-3" /> Ofertas
            </ButtonLink>
          </div>
        </div>

        {featured && (
          <div className="hidden lg:flex lg:justify-end">
            <Link
              href={`/producto/${featured.slug}`}
              className="img-zoom-container group w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-brand-live/40"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-stone">
                <Image
                  src={storagePublicUrl(featured.imagePath) ?? PRODUCT_PLACEHOLDER}
                  alt={featured.name}
                  fill
                  sizes="384px"
                  className="object-cover"
                  unoptimized={!featured.imagePath}
                />
              </div>
              <p className="mt-5 text-[10px] font-black tracking-widest text-brand-live uppercase">
                Destacado
              </p>
              <p className="font-display mt-1 text-lg font-black">{featured.name}</p>
              <p className="mt-1 text-xs text-white/40">
                {featured.category.name} · {featured.brand.name}
              </p>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------ Explora por objetivo --- */

const GOALS = [
  { slug: "proteinas", label: "Masa muscular", desc: "Proteínas y ganadores" },
  { slug: "pre-entrenos", label: "Rendimiento", desc: "Pre-entrenos y energía" },
  { slug: "aminoacidos", label: "Recuperación", desc: "Aminoácidos y colágeno" },
];

export function ExploraSection({ categories }: { categories: Taxon[] }) {
  const available = GOALS.filter((g) => categories.some((c) => c.slug === g.slug));
  if (!available.length) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-8">
      <h2 className="font-display text-2xl font-black tracking-tight text-brand-charcoal md:text-3xl">
        Explorá por objetivo
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {available.map((g) => (
          <Link
            key={g.slug}
            href={`/categoria/${g.slug}`}
            className="group flex flex-col gap-2 rounded-3xl border border-brand-charcoal/8 bg-brand-stone/50 p-8 transition-all hover:-translate-y-1 hover:border-brand-live hover:shadow-hover"
          >
            <span className="font-display text-xl font-black text-brand-charcoal">{g.label}</span>
            <span className="text-sm text-brand-charcoal/50">{g.desc}</span>
            <span className="mt-3 flex items-center gap-2 text-[10px] font-black tracking-widest text-brand-moss uppercase">
              Ver productos <Icon icon={faArrowRight} className="h-2.5 w-2.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------- Bloque B2B ------ */

/**
 * En el sitio viejo el panel escribía config/wholesale pero los ids
 * #ws-t / #ws-d / #ws-b no existían en index.html: el contenido nunca se
 * mostraba y el bloque tenía el texto quemado. Acá se cablea de verdad.
 */
export function WholesaleBlock({
  wholesale,
  commerce,
}: {
  wholesale: WholesaleSettings;
  commerce: CommerceSettings;
}) {
  return (
    <section id="mayorista" className="bg-brand-stone">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
        <div>
          <span className="text-[10px] font-black tracking-widest text-brand-moss uppercase">
            B2B
          </span>
          <h2 className="font-display mt-3 text-2xl font-black tracking-tight text-brand-charcoal md:text-3xl">
            {wholesale.title}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-charcoal/60">
            {wholesale.description}
          </p>
        </div>

        <div className="flex flex-col gap-5 rounded-3xl bg-white p-8 shadow-soft">
          <ul className="flex flex-col gap-3">
            {wholesale.benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm font-medium text-brand-charcoal">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-live">
                  <Icon icon={faCheck} className="h-2 w-2 text-brand-charcoal" />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row">
            <WholesaleInquiryButton phone={commerce.whatsappPhone} />
            <a
              href={waLink(
                commerce.whatsappPhone,
                "Hola Yuyo Sports, quiero consultar por compras mayoristas.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-brand-charcoal/15 px-6 py-4 text-xs font-black tracking-widest text-brand-charcoal uppercase transition-all hover:bg-brand-stone"
            >
              <Icon icon={faWhatsapp} className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- Value props ---- */

const VALUE_ICONS = [faTruck, faShieldHalved, faCreditCard, faHeadset];

export function ValueProps({ values }: { values: ValuesSettings }) {
  return (
    <section className="border-y border-brand-charcoal/8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 md:grid-cols-4 md:px-8">
        {values.items.map((v, i) => (
          <div key={v.title} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-brand-live/15 text-brand-moss">
              <Icon icon={VALUE_ICONS[i] ?? faCheck} className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-xs font-black text-brand-charcoal">{v.title}</p>
              <p className="mt-0.5 text-xs text-brand-charcoal/50">{v.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------ Dual banners ----- */

export function DualBanners({ banners }: { banners: BannersSettings }) {
  const cards = [
    { ...banners.retail, href: "/#catalog", dark: false },
    { ...banners.wholesale, href: "/mayorista", dark: true },
  ];
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-14 md:grid-cols-2 md:px-8">
      {cards.map((c) => (
        <div
          key={c.title}
          className={
            c.dark
              ? "flex flex-col gap-3 rounded-3xl bg-brand-charcoal p-10 text-white"
              : "flex flex-col gap-3 rounded-3xl border border-brand-charcoal/8 bg-brand-stone/60 p-10"
          }
        >
          <h3 className="font-display text-xl font-black">{c.title}</h3>
          <p className={c.dark ? "text-sm text-white/50" : "text-sm text-brand-charcoal/55"}>
            {c.description}
          </p>
          <ButtonLink href={c.href} className="mt-3 self-start" size="md">
            {c.buttonLabel}
          </ButtonLink>
        </div>
      ))}
    </section>
  );
}

/* ------------------------------------------------------ Offers banner ---- */

export function OffersBanner({ offers }: { offers: OffersSettings }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-14 md:px-8">
      <Link
        href="/ofertas"
        className="group flex flex-col items-start gap-4 rounded-3xl bg-brand-live p-10 transition-all hover:shadow-hover md:flex-row md:items-center md:justify-between"
      >
        <div>
          <span className="text-[10px] font-black tracking-widest text-brand-charcoal/60 uppercase">
            {offers.label}
          </span>
          <h3 className="font-display mt-2 text-2xl font-black text-brand-charcoal md:text-3xl">
            {offers.title}
          </h3>
          <p className="mt-2 max-w-lg text-sm text-brand-charcoal/70">{offers.description}</p>
        </div>
        <span className="flex items-center gap-2 rounded-2xl bg-brand-charcoal px-8 py-4 text-xs font-black tracking-widest text-brand-live uppercase">
          Ver ofertas <Icon icon={faArrowRight} className="h-3 w-3" />
        </span>
      </Link>
    </section>
  );
}
