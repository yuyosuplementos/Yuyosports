"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  faGaugeHigh,
  faBoxesStacked,
  faTags,
  faSliders,
  faArrowRightFromBracket,
  faBars,
  faXmark,
  faUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: faGaugeHigh, exact: true },
  { href: "/admin/productos", label: "Productos", icon: faBoxesStacked },
  { href: "/admin/taxonomia", label: "Categorías y marcas", icon: faTags },
  { href: "/admin/contenido/general", label: "Contenido", icon: faSliders, match: "/admin/contenido" },
];

export function AdminShell({ email, children }: { email: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.match ?? item.href);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-colors",
            isActive(item)
              ? "bg-brand-live text-brand-charcoal"
              : "text-white/60 hover:bg-white/5 hover:text-white",
          )}
        >
          <Icon icon={item.icon} className="h-3.5 w-3.5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-brand-stone">
      <aside className="hidden w-64 shrink-0 flex-col bg-brand-charcoal md:flex">
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <span className="font-display text-base font-black tracking-widest uppercase">
            <span className="text-brand-live">YUYO</span> <span className="text-white">SPORTS</span>
          </span>
        </div>
        {nav}
        <div className="border-t border-white/10 p-4">
          <p className="truncate px-2 pb-3 text-[11px] text-white/35">{email}</p>
          <Link
            href="/"
            target="_blank"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-[11px] font-bold text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Icon icon={faUpRightFromSquare} className="h-3 w-3" /> Ver la tienda
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[11px] font-bold text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Icon icon={faArrowRightFromBracket} className="h-3 w-3" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-brand-charcoal/60" onClick={() => setOpen(false)} />
          <aside className="absolute top-0 left-0 flex h-full w-64 flex-col bg-brand-charcoal">
            <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
              <span className="font-display text-base font-black tracking-widest text-white uppercase">
                Menú
              </span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú">
                <Icon icon={faXmark} className="h-4 w-4 text-white/60" />
              </button>
            </div>
            {nav}
            <div className="border-t border-white/10 p-4">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[11px] font-bold text-white/60"
                >
                  <Icon icon={faArrowRightFromBracket} className="h-3 w-3" /> Cerrar sesión
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 shrink-0 items-center gap-4 border-b border-brand-charcoal/8 bg-white px-4 md:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="rounded-xl p-2.5 text-brand-charcoal hover:bg-brand-stone md:hidden"
          >
            <Icon icon={faBars} className="h-4 w-4" />
          </button>
          <span className="font-display text-sm font-black tracking-widest text-brand-charcoal uppercase">
            Panel
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
