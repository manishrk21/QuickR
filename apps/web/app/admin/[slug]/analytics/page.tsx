import { createClient } from "@/lib/supabase/server";
import { AnalyticsClient } from "@/components/admin/analytics/AnalyticsClient";

export default async function AnalyticsPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("slug", params.slug)
    .single();

  if (!restaurant) return null;

  const [daily, topItems, peakHours, summary] = await Promise.all([
    supabase.rpc("get_daily_revenue",     { p_restaurant_id: restaurant.id, p_days: 30 }),
    supabase.rpc("get_top_items",         { p_restaurant_id: restaurant.id, p_days: 30 }),
    supabase.rpc("get_peak_hours",        { p_restaurant_id: restaurant.id, p_days: 30 }),
    supabase.rpc("get_analytics_summary", { p_restaurant_id: restaurant.id, p_days: 30 }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Revenue, orders, and customer trends.
        </p>
      </div>

      <AnalyticsClient
        initialData={{
          daily:     daily.data     ?? [],
          topItems:  topItems.data  ?? [],
          peakHours: peakHours.data ?? [],
          summary:   summary.data?.[0] ?? null,
        }}
        restaurantId={restaurant.id}
        defaultDays={30}
      />
    </div>
  );
}
