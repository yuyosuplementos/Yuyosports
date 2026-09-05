"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Bloqueo de scroll por contador, no por overlay.
 *
 * Con dos overlays abiertos (drawer del carrito + modal de checkout) guardar
 * y restaurar `overflow` por separado deja el body bloqueado para siempre si
 * se cierran en orden distinto al de apertura. El contador lo hace conmutativo.
 */
let lockCount = 0;
let savedOverflow = "";

function lockScroll() {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) document.body.style.overflow = savedOverflow;
}

/**
 * Base de modales y drawers: bloquea el scroll, cierra con Escape, atrapa el
 * foco y lo devuelve al disparador. El sitio viejo no hacia nada de esto —
 * los modales eran divs con opacity-0/pointer-events-none y el foco se perdia
 * detras del overlay.
 */
function useOverlayBehavior(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const nodes = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [open, onClose],
  );

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    lockScroll();
    document.addEventListener("keydown", onKeyDown);

    const t = setTimeout(() => {
      const target = ref.current?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus();
    }, 50);

    return () => {
      clearTimeout(t);
      unlockScroll();
      document.removeEventListener("keydown", onKeyDown);
      restoreTo.current?.focus?.();
    };
  }, [open, onKeyDown]);

  return ref;
}

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
  className?: string;
}

export function Modal({ open, onClose, children, labelledBy, className }: OverlayProps) {
  const ref = useOverlayBehavior(open, onClose);
  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[55] flex items-center justify-center bg-brand-charcoal/60 p-4 backdrop-blur-sm transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white shadow-soft-lg transition-transform duration-300",
          open ? "scale-100" : "scale-95",
          className ?? "max-w-lg",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, children, labelledBy, className }: OverlayProps) {
  const ref = useOverlayBehavior(open, onClose);
  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 bg-brand-charcoal/60 backdrop-blur-sm transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "absolute top-0 right-0 flex h-full w-full flex-col bg-white shadow-soft-lg transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
          className ?? "max-w-md",
        )}
      >
        {children}
      </div>
    </div>
  );
}
