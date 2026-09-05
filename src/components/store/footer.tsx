import Link from "next/link";
import { faWhatsapp, faInstagram, faFacebookF } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { waLink } from "@/lib/utils/whatsapp";
import { SITE } from "@/lib/constants";
import type { Taxon } from "@/types/domain";
import type { FooterSettings, CommerceSettings } from "@/lib/schemas/settings";

export function Footer({
  footer,
  commerce,
  categories,
}: {
  footer: FooterSettings;
  commerce: CommerceSettings;
  categories: Taxon[];
}) {
  return (
    <footer className="bg-brand-charcoal text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <p className="font-display text-lg font-black tracking-widest uppercase">
            <span className="text-brand-live">YUYO</span> SPORTS
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
            {footer.description}
          </p>
          <div className="mt-6 flex gap-2">
            <a
              href={waLink(commerce.whatsappPhone)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition-all hover:border-brand-live hover:bg-brand-live hover:text-brand-charcoal"
            >
              <Icon icon={faWhatsapp} className="h-4 w-4" />
            </a>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/30">
              <Icon icon={faInstagram} className="h-4 w-4" />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/30">
              <Icon icon={faFacebookF} className="h-4 w-4" />
            </span>
          </div>
        </div>

        <nav>
          <p className="text-[10px] font-black tracking-widest text-brand-live uppercase">
            Categorías
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/categoria/${c.slug}`}
                  className="text-sm text-white/50 transition-colors hover:text-brand-live"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/ofertas" className="text-sm text-white/50 transition-colors hover:text-brand-live">
                Ofertas
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="text-[10px] font-black tracking-widest text-brand-live uppercase">
            Contacto
          </p>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-white/50">
            <li className="flex items-start gap-3">
              <Icon icon={faWhatsapp} className="mt-1 h-3.5 w-3.5 text-brand-live" />
              <a
                href={waLink(commerce.whatsappPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-brand-live"
              >
                {footer.phone}
              </a>
            </li>
            {footer.email && (
              <li className="flex items-start gap-3">
                <Icon icon={faEnvelope} className="mt-1 h-3.5 w-3.5 text-brand-live" />
                <a href={`mailto:${footer.email}`} className="transition-colors hover:text-brand-live">
                  {footer.email}
                </a>
              </li>
            )}
            <li className="flex items-start gap-3">
              <Icon icon={faLocationDot} className="mt-1 h-3.5 w-3.5 text-brand-live" />
              <span>Buenos Aires, Argentina</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6 md:px-8">
        <p className="mx-auto max-w-7xl text-center text-[11px] text-white/30">
          © {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
