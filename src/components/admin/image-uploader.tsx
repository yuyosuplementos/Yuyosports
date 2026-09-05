"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { faUpload, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { createSignedUploadUrlAction } from "@/lib/actions/storage";
import { storagePublicUrl, PRODUCT_PLACEHOLDER } from "@/lib/utils/image";
import { toast } from "@/components/ui/toast";

const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const MAX_EDGE = 1600;

/** Redimensiona y convierte a WebP en el navegador antes de subir. */
async function toWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(w, h)
      : Object.assign(document.createElement("canvas"), { width: w, height: h });

  const ctx = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) throw new Error("No se pudo procesar la imagen.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: "image/webp", quality: 0.82 });
  }
  return new Promise<Blob>((resolve, reject) =>
    (canvas as HTMLCanvasElement).toBlob(
      (b) => (b ? resolve(b) : reject(new Error("No se pudo convertir la imagen."))),
      "image/webp",
      0.82,
    ),
  );
}

export function ImageUploader({
  slug,
  value,
  onChange,
  kind = "products",
}: {
  slug: string;
  value: string | null;
  onChange: (path: string | null) => void;
  kind?: "products" | "settings";
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = storagePublicUrl(value);

  async function handleFile(file: File) {
    if (!slug) return toast("Poné primero el nombre del producto.");
    if (!file.type.startsWith("image/")) return toast("El archivo no es una imagen.");
    if (file.size > MAX_INPUT_BYTES) return toast("La imagen es demasiado grande (máx. 15 MB).");

    setBusy(true);
    try {
      const blob = await toWebp(file);

      // Signed URL: el archivo va directo al bucket y no pasa por la función
      // serverless, que en Vercel topea el body en 4.5 MB.
      const signed = await createSignedUploadUrlAction(kind, slug);
      if (!signed.ok) throw new Error(signed.error);

      const sb = createBrowserSupabase();
      const { error } = await sb.storage
        .from("media")
        .uploadToSignedUrl(signed.path, signed.token, blob, { contentType: "image/webp" });
      if (error) throw new Error(error.message);

      onChange(signed.path);
      toast(`Imagen subida (${(blob.size / 1024).toFixed(0)} KB)`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-brand-stone">
        <Image
          src={preview ?? PRODUCT_PLACEHOLDER}
          alt=""
          fill
          sizes="112px"
          className="object-cover"
          unoptimized={!preview}
        />
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="btn-premium flex items-center gap-2 rounded-xl bg-brand-charcoal px-5 py-3 text-[11px] font-black tracking-widest text-brand-live uppercase disabled:opacity-50"
        >
          <Icon icon={busy ? faSpinner : faUpload} className="h-3 w-3" spin={busy} />
          {busy ? "Subiendo…" : preview ? "Cambiar imagen" : "Subir imagen"}
        </button>

        {preview && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex items-center gap-2 text-[11px] font-bold text-brand-charcoal/45 transition-colors hover:text-red-600"
          >
            <Icon icon={faTrash} className="h-2.5 w-2.5" /> Quitar
          </button>
        )}
        <p className="max-w-xs text-[11px] text-brand-charcoal/40">
          Se redimensiona a {MAX_EDGE}px y se convierte a WebP automáticamente.
        </p>
      </div>
    </div>
  );
}
