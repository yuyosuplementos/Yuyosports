import { cn } from "@/lib/utils/cn";

const TONES = {
  live: "bg-brand-live text-brand-charcoal",
  charcoal: "bg-brand-charcoal text-white",
  danger: "bg-red-600 text-white",
  outline: "border border-brand-charcoal/15 bg-white text-brand-charcoal",
} as const;

export function Badge({
  children,
  tone = "live",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
