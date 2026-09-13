"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { faFloppyDisk, faSpinner, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { toast } from "@/components/ui/toast";
import { ImageUploader } from "./image-uploader";
import { saveSettingsAction } from "@/lib/actions/settings";
import { settingsSchemas, type SettingsKey } from "@/lib/schemas/settings";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

type AnyRecord = Record<string, unknown>;

export function SettingsForm({
  sectionKey,
  initial,
}: {
  sectionKey: SettingsKey;
  initial: unknown;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Se parte del valor guardado; si está vacío o corrupto, del default.
  const parsed = settingsSchemas[sectionKey].safeParse(initial);
  const [value, setValue] = useState<AnyRecord>(
    (parsed.success ? parsed.data : DEFAULT_SETTINGS[sectionKey]) as AnyRecord,
  );

  function patch(k: string, v: unknown) {
    setValue((s) => ({ ...s, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveSettingsAction(sectionKey, value);
      toast(res.ok ? "Contenido guardado" : res.error);
      if (res.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-card">
        {renderSection(sectionKey, value, patch)}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="btn-premium flex w-fit items-center gap-2 rounded-2xl bg-brand-live px-8 py-4 text-xs font-black tracking-widest text-brand-charcoal uppercase disabled:opacity-50"
      >
        <Icon icon={pending ? faSpinner : faFloppyDisk} className="h-3.5 w-3.5" spin={pending} />
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------- secciones -- */

function renderSection(key: SettingsKey, v: AnyRecord, patch: (k: string, v: unknown) => void) {
  switch (key) {
    case "general":
      return (
        <>
          <Text label="Etiqueta superior" value={str(v.heroLabel)} onChange={(x) => patch("heroLabel", x)} />
          <Text label="Título" value={str(v.heroTitle)} onChange={(x) => patch("heroTitle", x)} />
          <Area label="Subtítulo" value={str(v.heroDesc)} onChange={(x) => patch("heroDesc", x)} />
          <Group label="Imagen del banner">
            <ImageUploader
              kind="settings"
              slug="hero"
              value={str(v.heroImagePath) || null}
              onChange={(p) => patch("heroImagePath", p)}
            />
          </Group>
        </>
      );

    case "promos":
      return (
        <ObjectList
          label="Líneas del carrusel"
          hint="Cada línea rota cada 4 segundos."
          items={(v.lines as Array<{ title: string; detail: string }>) ?? []}
          onChange={(items) => patch("lines", items)}
          blank={{ title: "", detail: "" }}
          fields={[
            { key: "title", label: "Título" },
            { key: "detail", label: "Detalle (opcional)" },
          ]}
        />
      );

    case "values":
      return (
        <>
          {((v.items as Array<{ title: string; description: string }>) ?? []).map((item, i) => (
            <Group key={i} label={`Ítem ${i + 1}`}>
              <Text
                label="Título"
                value={item.title}
                onChange={(x) => {
                  const next = [...(v.items as Array<{ title: string; description: string }>)];
                  next[i] = { ...next[i], title: x };
                  patch("items", next);
                }}
              />
              <Text
                label="Descripción"
                value={item.description}
                onChange={(x) => {
                  const next = [...(v.items as Array<{ title: string; description: string }>)];
                  next[i] = { ...next[i], description: x };
                  patch("items", next);
                }}
              />
            </Group>
          ))}
        </>
      );

    case "banners":
      return (
        <>
          {(["retail", "wholesale"] as const).map((side) => {
            const b = (v[side] ?? {}) as { title: string; description: string; buttonLabel: string };
            const upd = (k: string, x: string) => patch(side, { ...b, [k]: x });
            return (
              <Group key={side} label={side === "retail" ? "Minorista" : "Mayorista"}>
                <Text label="Título" value={b.title ?? ""} onChange={(x) => upd("title", x)} />
                <Area
                  label="Descripción"
                  value={b.description ?? ""}
                  onChange={(x) => upd("description", x)}
                />
                <Text
                  label="Texto del botón"
                  value={b.buttonLabel ?? ""}
                  onChange={(x) => upd("buttonLabel", x)}
                />
              </Group>
            );
          })}
        </>
      );

    case "offers":
      return (
        <>
          <Text label="Etiqueta" value={str(v.label)} onChange={(x) => patch("label", x)} />
          <Text label="Título" value={str(v.title)} onChange={(x) => patch("title", x)} />
          <Area label="Descripción" value={str(v.description)} onChange={(x) => patch("description", x)} />
        </>
      );

    case "wholesale":
      return (
        <>
          <Text label="Título" value={str(v.title)} onChange={(x) => patch("title", x)} />
          <Area label="Descripción" value={str(v.description)} onChange={(x) => patch("description", x)} />
          <StringList
            label="Beneficios"
            items={(v.benefits as string[]) ?? []}
            onChange={(x) => patch("benefits", x)}
          />
        </>
      );

    case "footer":
      return (
        <>
          <Area label="Descripción de marca" value={str(v.description)} onChange={(x) => patch("description", x)} />
          <Text label="Teléfono (visible)" value={str(v.phone)} onChange={(x) => patch("phone", x)} />
          <Text label="Email" value={str(v.email)} onChange={(x) => patch("email", x)} />
        </>
      );

    case "commerce":
      return (
        <>
          <Text
            label="WhatsApp (solo dígitos, con código de país)"
            value={str(v.whatsappPhone)}
            onChange={(x) => patch("whatsappPhone", x)}
            hint="Ej: 5492262535954. Se usa en todos los enlaces del sitio."
          />
          <Num
            label="Compra mínima mayorista"
            value={num(v.wholesaleMinimum)}
            onChange={(x) => patch("wholesaleMinimum", x)}
            hint="Bloquea el checkout si el subtotal mayorista no llega."
          />
        </>
      );
  }
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" ? v : 0);
const inputCls =
  "w-full rounded-xl border-none bg-brand-stone px-4 py-3 text-sm font-medium text-brand-charcoal outline-none focus:ring-2 focus:ring-brand-live";

/* ----------------------------------------------------------- primitivos -- */

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 rounded-2xl border border-brand-charcoal/8 p-4">
      <legend className="px-2 text-[10px] font-black tracking-widest text-brand-charcoal/45 uppercase">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

function Text({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-black text-brand-charcoal/60">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      {hint && <span className="text-[11px] text-brand-charcoal/35">{hint}</span>}
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-black text-brand-charcoal/60">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

function Num({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-black text-brand-charcoal/60">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={inputCls}
      />
      {hint && <span className="text-[11px] text-brand-charcoal/35">{hint}</span>}
    </label>
  );
}

function StringList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-black text-brand-charcoal/60">{label}</span>
      <ul className="flex flex-col gap-2">
        {items.map((it, i) => (
          <li key={`${it}-${i}`} className="flex gap-2">
            <input
              value={it}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className={inputCls}
            />
            <button
              type="button"
              aria-label={`Quitar ${it}`}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="shrink-0 rounded-xl px-3 text-brand-charcoal/40 hover:bg-red-50 hover:text-red-600"
            >
              <Icon icon={faXmark} className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (draft.trim()) onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
          placeholder="Agregar…"
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => {
            if (draft.trim()) onChange([...items, draft.trim()]);
            setDraft("");
          }}
          className="shrink-0 rounded-xl bg-brand-charcoal px-4 text-brand-live"
        >
          <Icon icon={faPlus} className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function ObjectList<T extends Record<string, string>>({
  label,
  hint,
  items,
  onChange,
  blank,
  fields,
}: {
  label: string;
  hint?: string;
  items: T[];
  onChange: (v: T[]) => void;
  blank: T;
  fields: Array<{ key: keyof T & string; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <span className="text-[11px] font-black text-brand-charcoal/60">{label}</span>
        {hint && <p className="text-[11px] text-brand-charcoal/35">{hint}</p>}
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className={cn("flex flex-col gap-2 rounded-2xl border border-brand-charcoal/8 p-3")}
        >
          {fields.map((f) => (
            <input
              key={f.key}
              value={item[f.key] ?? ""}
              placeholder={f.label}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], [f.key]: e.target.value };
                onChange(next);
              }}
              className={inputCls}
            />
          ))}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="self-start text-[11px] font-bold text-brand-charcoal/40 hover:text-red-600"
          >
            Quitar
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { ...blank }])}
        className="flex w-fit items-center gap-2 rounded-xl bg-brand-stone px-4 py-2.5 text-[11px] font-black tracking-widest text-brand-charcoal uppercase"
      >
        <Icon icon={faPlus} className="h-2.5 w-2.5" /> Agregar
      </button>
    </div>
  );
}
