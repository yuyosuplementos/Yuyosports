"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { faUpload, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/icon";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { createSignedUploadUrlAction } from "@/lib/actions/storage";
import {
  storagePublicUrl,
  PRODUCT_PLACEHOLDER,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  extensionFor,
} from "@/lib/utils/image";
import { toast } from "@/components/ui/toast";

/**
 * Sube la imagen TAL CUAL: sin redimensionar ni recomprimir.
 *
 * Antes se pasaba todo por un canvas a 1600px de lado máximo y se convertía
 * a WebP. Para las fotos de producto originales (de hasta 4 MB) tenía
 * sentido, pero le arruinaba el trabajo a quien prepara un banner con las
 * medidas exactas que quiere. La optimización de entrega ya la hace
 * next/image en cada tamaño de pantalla, así que recomprimir antes de
 * guardar no aportaba nada que no se estuviera haciendo igual.
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

export function ImageUploader({
  slug,
  value,
  onChange,
  kind = "products",
}: {
  slug: string;
  value: string | null;
  /** `dimensions` llega solo cuando se sube un archivo, no al quitarlo. */
  onChange: (path: string | null, dimensions?: ImageDimensions) => void;
  kind?: "products" | "settings";
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = storagePublicUrl(value);

  async function handleFile(file: File) {
    if (!slug) return toast("Poné primero el nombre del producto.");

    const ext = extensionFor(file.type);
    if (!ext) {
      return toast("Formato no admitido. Usá JPG, PNG, WebP o AVIF.");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      return toast(`La imagen pesa ${mb} MB y el máximo es ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`);
    }

    setBusy(true);
    try {
      // Las dimensiones reales se leen del archivo, no se piden al usuario.
      const bitmap = await createImageBitmap(file);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();

      // Signed URL: el archivo va directo al bucket y no pasa por la función
      // serverless, que en Vercel topea el body en 4.5 MB.
      const signed = await createSignedUploadUrlAction(kind, slug, ext);
      if (!signed.ok) throw new Error(signed.error);

      const sb = createBrowserSupabase();
      const { error } = await sb.storage
        .from("media")
        .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });
      if (error) throw new Error(error.message);

      onChange(signed.path, dimensions);
      toast(`Imagen subida (${(file.size / 1024).toFixed(0)} KB)`);
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
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
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
          Se sube tal cual, sin recortar ni recomprimir. JPG, PNG, WebP o AVIF, hasta{" "}
          {MAX_IMAGE_BYTES / 1024 / 1024} MB.
        </p>
      </div>
    </div>
  );
}
