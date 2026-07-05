export const dynamic = "force-dynamic";
import { rateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "admin");
    if (limited) return limited;

    const authSupabase = createClient();
    const { data: { session } } = await authSupabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("q")?.trim() ?? "";
    const sortBy = searchParams.get("sort") ?? "last_visit";

    const { data: member, error: memberError } = await authSupabase
      .from("tenant_members")
      .select("restaurant_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (memberError || !member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = member.restaurant_id;
    const { data: restaurantData } = await adminSupabase
      .from("restaurants")
      .select("loyalty_streak_target")
      .eq("id", restaurantId)
      .maybeSingle();

    const streakTarget = restaurantData?.loyalty_streak_target ?? 5;

    let visibleCustomers: any[] = [];

    try {
      const { data, error } = await adminSupabase.rpc("get_customers_for_admin", {
        p_restaurant_id: restaurantId,
        p_search: search,
        p_sort: sortBy,
        p_limit: 30,
        p_offset: 0,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        const customerIds = (data ?? [])
          .map((customer: any) => customer?.id)
          .filter(Boolean);

        if (customerIds.length > 0) {
          const { data: customerAuthRows } = await adminSupabase
            .from("customers")
            .select("id, google_id, mobile, is_guest")
            .in("id", customerIds);

          const authMap = new Map((customerAuthRows ?? []).map((row: any) => [row.id, row]));

          visibleCustomers = (data ?? []).filter((customer: any) => {
            const authInfo = authMap.get(customer.id);
            return !authInfo?.is_guest && (Boolean(authInfo?.mobile) || Boolean(authInfo?.google_id));
          });
        }
      }
    } catch (rpcError) {
      console.error("[admin/customers] RPC fallback failed", rpcError);
    }

    if (visibleCustomers.length === 0) {
      let query = adminSupabase
        .from("customers")
        .select("id, name, mobile, google_id, created_at, is_guest")
        .eq("restaurant_id", restaurantId)
        .eq("is_guest", false)
        .order("created_at", { ascending: false })
        .limit(30);

      if (search) {
        query = query.or(`mobile.ilike.%${search}%,name.ilike.%${search}%`);
      }

      const { data: customerRows, error: customerRowsError } = await query;

      if (customerRowsError) {
        return NextResponse.json({ error: customerRowsError.message }, { status: 500 });
      }

      const rows = (customerRows ?? []).filter((customer: any) => !customer.is_guest && (Boolean(customer.mobile) || Boolean(customer.google_id)));
      if (rows.length === 0) {
        return NextResponse.json({ customers: [] });
      }

      const customerIds = rows.map((customer: any) => customer.id);

      const [{ data: orders }, { data: visits }, { data: rewards }] = await Promise.all([
        adminSupabase
          .from("orders")
          .select("customer_id, total_amount, status")
          .in("customer_id", customerIds)
          .eq("restaurant_id", restaurantId),
        adminSupabase
          .from("loyalty_visits")
          .select("customer_id, visit_date")
          .in("customer_id", customerIds)
          .eq("restaurant_id", restaurantId),
        adminSupabase
          .from("loyalty_rewards")
          .select("customer_id, is_redeemed")
          .in("customer_id", customerIds)
          .eq("restaurant_id", restaurantId),
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

      visibleCustomers = rows.map((customer: any) => {
        const stats = orderMap.get(customer.id) ?? { total_orders: 0, total_spent: 0 };
        const visitDates = visitMap.get(customer.id) ?? [];
        const lastVisit = visitDates.length > 0 ? visitDates.sort().at(-1) ?? null : null;
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
          streak_progress: visitCount % streakTarget,
          has_reward: rewardIds.has(customer.id),
        };
      });
    }

    const sortedCustomers = [...visibleCustomers].sort((a, b) => {
      if (sortBy === "total_spent") return Number(b.total_spent ?? 0) - Number(a.total_spent ?? 0);
      if (sortBy === "total_orders") return Number(b.total_orders ?? 0) - Number(a.total_orders ?? 0);
      if (sortBy === "streak") return Number(b.visit_count ?? 0) - Number(a.visit_count ?? 0);
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    });

    return NextResponse.json({ customers: sortedCustomers });
  } catch (error) {
    console.error("[admin/customers] Failed to load customers", error);
    return NextResponse.json({ error: "Failed to load customers" }, { status: 500 });
  }
}
