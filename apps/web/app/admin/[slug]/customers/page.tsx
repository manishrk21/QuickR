import { CustomersClient } from "@/components/admin/CustomersClient";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
// // CHANGE HERE 1: Added Suspense import to safely catch client-side Hot Module Replacement shifts
// import { Suspense } from "react"; 

export default async function CustomersPage({
  params,
}: {
  params: { slug: string };
}) {
  const authSupabase = createClient();
  const { data: { session } } = await authSupabase.auth.getSession();

  if (!session) return null;

  const { data: restaurant } = await authSupabase
    .from("restaurants")
    .select("id, loyalty_streak_target")
    .eq("slug", params.slug)
    .single();

  if (!restaurant) return null;

  const { data: member } = await authSupabase
    .from("tenant_members")
    .select("restaurant_id")
    .eq("user_id", session.user.id)
    .eq("restaurant_id", restaurant.id)
    .single();

  if (!member) return null;

  let customers: any[] = [];

  const { data: rpcCustomers, error: rpcError } = await adminSupabase.rpc("get_customers_for_admin", {
    p_restaurant_id: restaurant.id,
    p_search: "",
    p_sort: "last_visit",
    p_limit: 30,
    p_offset: 0,
  });

  if (!rpcError && Array.isArray(rpcCustomers) && rpcCustomers.length > 0) {
    customers = rpcCustomers.filter((customer: any) => !customer.is_guest && (Boolean(customer.mobile) || Boolean(customer.google_id)));
  } else {
    const { data: customerRows } = await adminSupabase
      .from("customers")
      .select("id, name, mobile, google_id, created_at, is_guest")
      .eq("restaurant_id", restaurant.id)
      .eq("is_guest", false)
      .order("created_at", { ascending: false })
      .limit(30);

    const rows = (customerRows ?? []).filter((customer: any) => !customer.is_guest && (Boolean(customer.mobile) || Boolean(customer.google_id)));
    if (rows.length > 0) {
      const customerIds = rows.map((customer: any) => customer.id);
      const [{ data: orders }, { data: visits }, { data: rewards }] = await Promise.all([
        adminSupabase
          .from("orders")
          .select("customer_id, total_amount, status")
          .in("customer_id", customerIds)
          .eq("restaurant_id", restaurant.id),
        adminSupabase
          .from("loyalty_visits")
          .select("customer_id, visit_date")
          .in("customer_id", customerIds)
          .eq("restaurant_id", restaurant.id),
        adminSupabase
          .from("loyalty_rewards")
          .select("customer_id, is_redeemed")
          .in("customer_id", customerIds)
          .eq("restaurant_id", restaurant.id),
      ]);

      const orderMap = new Map<string, { total_orders: number; total_spent: number }>();
      (orders ?? []).forEach((order: any) => {
        const existing = orderMap.get(order.customer_id) ?? { total_orders: 0, total_spent: 0 };
        existing.total_orders += 1;
        existing.total_spent += Number(order.total_amount ?? 0);
        orderMap.set(order.customer_id, existing);
      });

      const visitMap = new Map<string, string[]>();
      (visits ?? []).forEach((visit: any) => {
        const existing = visitMap.get(visit.customer_id) ?? [];
        existing.push(visit.visit_date);
        visitMap.set(visit.customer_id, existing);
      });

      const rewardIds = new Set((rewards ?? []).filter((reward: any) => !reward.is_redeemed).map((reward: any) => reward.customer_id));

      customers = rows.map((customer: any) => {
        const stats = orderMap.get(customer.id) ?? { total_orders: 0, total_spent: 0 };
        const visitDates = visitMap.get(customer.id) ?? [];
        const lastVisit = visitDates.length > 0 ? visitDates.sort().at(-1) ?? null : null;
        // // CHANGE HERE 2: Swapped out direct mutating sort with immutable timestamp evaluation to avoid hydration errors
        // const lastVisit = visitDates.length > 0 ? [...visitDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).at(-1) ?? null : null; 
        
        const visitCount = visitDates.length;

        return {
          id: customer.id,
          name: customer.name,
          mobile: customer.mobile,
          google_id: customer.google_id,
          is_guest: customer.is_guest,
          created_at: customer.created_at,
          total_orders: stats.total_orders,
          total_spent: stats.total_spent,
          last_visit: lastVisit,
          visit_count: visitCount,
          streak_progress: visitCount % restaurant.loyalty_streak_target,
          // // CHANGE HERE 3: Added a safety guard to stop division-by-zero database calculation errors
          // streak_progress: restaurant.loyalty_streak_target ? visitCount % restaurant.loyalty_streak_target : 0, 
          
          has_reward: rewardIds.has(customer.id),
        };
      });
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Loyalty streaks, visit history, and reward management.
        </p>
      </div>
      {/* CHANGE HERE 4: Wrapped client target module with Suspense wrapper to seal hydration parameters */}
      {/* <Suspense fallback={<div>Loading customer metrics...</div>}>  */}
        
        <CustomersClient
          initialCustomers={customers}
          streakTarget={restaurant.loyalty_streak_target}
          restaurantId={restaurant.id}
        />
      {/* </Suspense>  */}
    </div>
  );  
}
