import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const VARIANTS = {
  primary:
    "bg-brand-live text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-live shadow-soft",
  dark: "bg-brand-charcoal text-white hover:bg-brand-moss",
  outline:
    "border border-brand-charcoal/15 bg-white text-brand-charcoal hover:border-brand-live hover:bg-brand-stone",
  ghost: "text-brand-charcoal hover:bg-brand-stone",
} as const;

const SIZES = {
  sm: "px-4 py-2 text-[11px]",
  md: "px-6 py-3 text-xs",
  lg: "px-8 py-4 text-sm",
} as const;

type Common = {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
  children: React.ReactNode;
};

const base =
  "btn-premium inline-flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-moss";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(base, VARIANTS[variant], SIZES[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: Common & { href: string } & Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={cn(base, VARIANTS[variant], SIZES[size], className)} {...props} />
  );
}
