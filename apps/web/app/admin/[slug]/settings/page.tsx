import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", params.slug)
    .single();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      <p className="text-slate-500 mt-1 mb-8">Manage your restaurant profile.</p>
      <SettingsForm restaurant={restaurant} />
    </div>
  );
}
