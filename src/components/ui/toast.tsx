"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";

interface ToastState {
  message: string | null;
  token: number;
  show: (m: string) => void;
  hide: () => void;
}

/**
 * El toast viejo tenia una race: cada showToast() programaba su propio
 * setTimeout de 3s, asi que dos toasts seguidos hacian que el timer del
 * primero cerrara al segundo antes de tiempo. El `token` reinicia el efecto.
 */
export const useToast = create<ToastState>((set) => ({
  message: null,
  token: 0,
  show: (message) => set((s) => ({ message, token: s.token + 1 })),
  hide: () => set({ message: null }),
}));

export const toast = (m: string) => useToast.getState().show(m);

export function Toaster() {
  const { message, token, hide } = useToast();

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(hide, 3000);
    return () => clearTimeout(t);
  }, [message, token, hide]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed right-4 bottom-4 z-[60] max-w-xs rounded-2xl bg-brand-charcoal px-5 py-4 text-xs font-bold text-white shadow-soft-lg transition-all duration-300",
        message ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0",
      )}
    >
      {message}
    </div>
  );
}
