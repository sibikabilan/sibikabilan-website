import { loadIndex } from "@/lib/cms/repo";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const { index } = await loadIndex();
  return (
    <div>
      <p className="eyebrow">Site settings</p>
      <h1 className="display mt-3 text-5xl text-ink">Customize the site.</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">Copy, links, sections and the default lighting. Changes go live as soon as you save.</p>
      <div className="mt-10">
        <SettingsForm key={index.updatedAt} initial={index.settings} />
      </div>
    </div>
  );
}
