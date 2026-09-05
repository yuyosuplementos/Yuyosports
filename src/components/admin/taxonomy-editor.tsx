"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { faPlus, faTrash, faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { toast } from "@/components/ui/toast";
import { saveTaxonAction, deleteTaxonAction } from "@/lib/actions/taxonomy";
import { slugify } from "@/lib/utils/slugify";

interface Row {
  id: number;
  slug: string;
  name: string;
  isActive: boolean;
  sortOrder?: number;
}

export function TaxonomyEditor({
  table,
  title,
  rows,
  counts,
}: {
  table: "categories" | "brands";
  title: string;
  rows: Row[];
  counts: Record<number, number>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState("");
  const [edits, setEdits] = useState<Record<number, string>>({});

  function save(payload: { id?: number; name: string; isActive: boolean; sortOrder?: number }) {
    startTransition(async () => {
      const res = await saveTaxonAction(table, payload);
      toast(res.ok ? "Guardado" : res.error);
      if (res.ok) {
        setDraft("");
        setEdits({});
        router.refresh();
      }
    });
  }

  function remove(row: Row) {
    const n = counts[row.id] ?? 0;
    if (n > 0) {
      return toast(`"${row.name}" tiene ${n} producto(s). Reasignalos antes de borrar.`);
    }
    if (!confirm(`¿Eliminar "${row.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteTaxonAction(table, row.id);
      toast(res.ok ? "Eliminado" : res.error);
      if (res.ok) router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card">
      <h2 className="text-[10px] font-black tracking-widest text-brand-charcoal/45 uppercase">
        {title}
      </h2>

      <ul className="flex flex-col divide-y divide-brand-charcoal/5">
        {rows.map((r) => {
          const n = counts[r.id] ?? 0;
          const value = edits[r.id] ?? r.name;
          const dirty = value !== r.name;
          return (
            <li key={r.id} className="flex items-center gap-2 py-2.5">
              <input
                value={value}
                onChange={(e) => setEdits((s) => ({ ...s, [r.id]: e.target.value }))}
                className="flex-1 rounded-xl border-none bg-brand-stone px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-live"
              />
              <span className="w-24 shrink-0 text-right text-[11px] text-brand-charcoal/40">
                {n} prod.
              </span>
              {dirty && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => save({ id: r.id, name: value, isActive: r.isActive, sortOrder: r.sortOrder })}
                  aria-label={`Guardar ${r.name}`}
                  className="rounded-lg bg-brand-live p-2.5 text-brand-charcoal disabled:opacity-50"
                >
                  <Icon icon={faCheck} className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                disabled={pending || n > 0}
                onClick={() => remove(r)}
                aria-label={`Eliminar ${r.name}`}
                title={n > 0 ? "Tiene productos asociados" : "Eliminar"}
                className="rounded-lg p-2.5 text-brand-charcoal/40 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Icon icon={faTrash} className="h-3 w-3" />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Nombre nuevo…"
          className="flex-1 rounded-xl border-none bg-brand-stone px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-live"
        />
        <button
          type="button"
          disabled={pending || !draft.trim()}
          onClick={() => save({ name: draft.trim(), isActive: true })}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-brand-charcoal px-5 text-[11px] font-black tracking-widest text-brand-live uppercase disabled:opacity-40"
        >
          <Icon icon={pending ? faSpinner : faPlus} className="h-3 w-3" spin={pending} /> Agregar
        </button>
      </div>
      {draft.trim() && (
        <p className="text-[11px] text-brand-charcoal/35">URL: /{slugify(draft)}</p>
      )}
    </section>
  );
}
