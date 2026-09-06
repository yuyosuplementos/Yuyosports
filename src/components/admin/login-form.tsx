"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInAction } from "@/lib/actions/auth";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction] = useActionState(signInAction, null as { error?: string } | null);
  const error = state?.error ?? initialError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-charcoal p-4">
      <form
        action={formAction}
        className="flex w-full max-w-sm flex-col gap-5 rounded-3xl bg-white p-8 shadow-soft-lg"
      >
        <div className="text-center">
          <p className="font-display text-lg font-black tracking-widest uppercase">
            <span className="text-brand-live">YUYO</span>{" "}
            <span className="text-brand-charcoal">SPORTS</span>
          </p>
          <p className="mt-2 text-xs text-brand-charcoal/50">Panel de administración</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black tracking-widest text-brand-charcoal/50 uppercase">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="rounded-xl border-none bg-brand-stone px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-live"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black tracking-widest text-brand-charcoal/50 uppercase">
            Contraseña
          </span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded-xl border-none bg-brand-stone px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-live"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
            {error}
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-premium rounded-2xl bg-brand-live px-6 py-4 text-xs font-black tracking-widest text-brand-charcoal uppercase transition-all hover:bg-brand-charcoal hover:text-brand-live disabled:opacity-50"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}
