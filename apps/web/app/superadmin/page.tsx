// apps/web/app/superadmin/page.tsx
import { adminSupabase } from "@/lib/supabase/admin";
import { SuperadminClient } from "@/components/superadmin/SuperadminClient";

export default async function SuperadminPage() {
  const { data: restaurants } = await adminSupabase
    .rpc("get_all_restaurants_for_superadmin");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">All Restaurants</h1>
        <p className="text-slate-500 text-sm mt-1">
          {restaurants?.length ?? 0} restaurants on QuickR
        </p>
      </div>

      <SuperadminClient initialRestaurants={restaurants ?? []} />
    </div>
  );
}
