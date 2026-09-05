import { notFound } from "next/navigation";
import { getAdminSettings } from "@/lib/data/admin";
import { SettingsForm, SECTIONS } from "@/components/admin/settings-form";
import { SETTINGS_KEYS, type SettingsKey } from "@/lib/schemas/settings";

export default async function ContenidoSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!SETTINGS_KEYS.includes(section as SettingsKey)) notFound();
  const key = section as SettingsKey;

  const all = await getAdminSettings();
  const meta = SECTIONS.find((s) => s.key === key);

  return (
    <div className="flex flex-col gap-4">
      {meta && <p className="text-sm text-brand-charcoal/50">{meta.hint}</p>}
      <SettingsForm sectionKey={key} initial={all[key]} />
    </div>
  );
}
