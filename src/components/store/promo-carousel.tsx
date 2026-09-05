"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";
import type { PromosSettings } from "@/lib/schemas/settings";

const INTERVAL = 4000;

/**
 * Carrusel de la barra superior.
 *
 * El original guardaba título y subtítulo en un solo string separado por "|"
 * y los parseaba en el cliente; ahora vienen como campos separados desde
 * settings.promos. Además el setInterval viejo corría siempre, incluso con la
 * barra oculta: acá se pausa cuando la pestaña no está visible.
 */
export function PromoCarousel({ promos }: { promos: PromosSettings }) {
  const lines = promos.lines;
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (lines.length <= 1) return;
      setExiting(index);
      setTimeout(() => {
        setIndex((i) => (i + dir + lines.length) % lines.length);
        setExiting(null);
      }, 400);
    },
    [index, lines.length],
  );

  useEffect(() => {
    if (lines.length <= 1) return;
    function start() {
      stop();
      timer.current = setInterval(() => go(1), INTERVAL);
    }
    function stop() {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    }
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [go, lines.length]);

  if (!lines.length) return null;

  return (
    <div className="relative flex h-[45px] items-center justify-center overflow-hidden bg-brand-live px-12">
      {lines.length > 1 && (
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Promoción anterior"
          className="absolute left-3 z-10 rounded-full p-1.5 text-brand-charcoal/50 transition-colors hover:text-brand-charcoal"
        >
          <Icon icon={faChevronLeft} className="h-2.5 w-2.5" />
        </button>
      )}

      <div className="relative h-full w-full">
        {lines.map((line, i) => (
          <div
            key={`${line.title}-${i}`}
            className={cn(
              "promo-slide h-full",
              i === index && exiting === null && "active",
              exiting === i && "exit",
            )}
            aria-hidden={i !== index}
          >
            <span className="text-[11px] font-black tracking-widest text-brand-charcoal uppercase">
              {line.title}
            </span>
            {line.detail && (
              <span className="hidden text-[11px] font-medium text-brand-moss sm:inline">
                {line.detail}
              </span>
            )}
          </div>
        ))}
      </div>

      {lines.length > 1 && (
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Promoción siguiente"
          className="absolute right-3 z-10 rounded-full p-1.5 text-brand-charcoal/50 transition-colors hover:text-brand-charcoal"
        >
          <Icon icon={faChevronRight} className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}
