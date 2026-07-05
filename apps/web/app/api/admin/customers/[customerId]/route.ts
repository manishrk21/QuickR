import { rateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;
  
  const authSupabase = createClient();
  const { data: { session } } = await authSupabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: member } = await authSupabase
    .from("tenant_members")
    .select("restaurant_id, restaurants(loyalty_streak_target)")
    .eq("user_id", session.user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurantId = member.restaurant_id;
  const streakTarget = (member.restaurants as any)?.loyalty_streak_target ?? 5;

  const { data: customer } = await adminSupabase
    .from("customers")
    .select("id, name, mobile, google_id, created_at, is_guest")
    .eq("id", params.customerId)
    .eq("restaurant_id", restaurantId)
    .single();

  if (!customer) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const hasAuthenticatedAccount = !customer.is_guest && (Boolean(customer.mobile) || Boolean((customer as any).google_id));
  if (!hasAuthenticatedAccount) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { data: orders } = await adminSupabase
    .from("orders")
    .select("id, status, total_amount, created_at, tables(label)")
    .eq("customer_id", params.customerId)
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: visits } = await adminSupabase
    .from("loyalty_visits")
    .select("id, visit_date, created_at")
    .eq("customer_id", params.customerId)
    .eq("restaurant_id", restaurantId)
    .order("visit_date", { ascending: false });

  const { data: rewards } = await adminSupabase
    .from("loyalty_rewards")
    .select("id, reward_type, is_redeemed, redeemed_at, created_at")
    .eq("customer_id", params.customerId)
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  const visitCount = visits?.length ?? 0;
  const streakProgress = visitCount % streakTarget;

  return NextResponse.json({
    customer,
    orders: orders ?? [],
    visits: visits ?? [],
    rewards: rewards ?? [],
    visitCount,
    streakProgress,
    streakTarget,
  });
}









// import { rateLimit } from "@/lib/security/rate-limit";
// import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";
// import { adminSupabase } from "@/lib/supabase/admin";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { customerId: string } }
// ) {
//   const limited = await rateLimit(req, "admin");
//   if (limited) return limited;
  
//   const authSupabase = createClient();
//   const { data: { session } } = await authSupabase.auth.getSession();
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { data: member } = await authSupabase
//     .from("tenant_members")
//     .select("restaurant_id, restaurants(loyalty_streak_target)")
//     .eq("user_id", session.user.id)
//     .single();

//   if (!member) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const restaurantId = member.restaurant_id;
//   const streakTarget = (member.restaurants as any)?.loyalty_streak_target ?? 5;

//   const { data: customer } = await adminSupabase
//     .from("customers")
//     .select("id, name, mobile, created_at, is_guest")
//     .eq("id", params.customerId)
//     .eq("restaurant_id", restaurantId)
//     .single();

//   if (!customer) {
//     return NextResponse.json({ error: "Not found." }, { status: 404 });
//   }

//   const hasAuthenticatedAccount = !customer.is_guest && (Boolean(customer.mobile) || Boolean((customer as any).google_id));
//   if (!hasAuthenticatedAccount) {
//     return NextResponse.json({ error: "Not found." }, { status: 404 });
//   }

//   const { data: orders } = await adminSupabase
//     .from("orders")
//     .select("id, status, total_amount, created_at, tables(label)")
//     .eq("customer_id", params.customerId)
//     .eq("restaurant_id", restaurantId)
//     .order("created_at", { ascending: false })
//     .limit(10);

//   const { data: visits } = await adminSupabase
//     .from("loyalty_visits")
//     .select("id, visit_date, created_at")
//     .eq("customer_id", params.customerId)
//     .eq("restaurant_id", restaurantId)
//     .order("visit_date", { ascending: false });

//   const { data: rewards } = await adminSupabase
//     .from("loyalty_rewards")
//     .select("id, reward_type, is_redeemed, redeemed_at, created_at")
//     .eq("customer_id", params.customerId)
//     .eq("restaurant_id", restaurantId)
//     .order("created_at", { ascending: false });

//   const visitCount = visits?.length ?? 0;
//   const streakProgress = visitCount % streakTarget;

//   return NextResponse.json({
//     customer,
//     orders: orders ?? [],
//     visits: visits ?? [],
//     rewards: rewards ?? [],
//     visitCount,
//     streakProgress,
//     streakTarget,
//   });
// }
