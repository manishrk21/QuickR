import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name")
    .eq("slug", params.slug)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        {restaurant?.name}
      </h1>
      <p className="text-slate-500 mt-1">
        Dashboard — orders and analytics coming in M5 and M9.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {["Orders today", "Revenue today", "Active tables"].map((label) => (
          <div key={label} className="border rounded-lg p-5 bg-white">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
