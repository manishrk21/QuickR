import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { adminSupabase } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "customer");
  if (limited) return limited;

  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: restaurant } = await adminSupabase
    .from("restaurants")
    .select("loyalty_streak_target")
    .eq("id", session.restaurantId)
    .single();

  const streakTarget = restaurant?.loyalty_streak_target ?? 5;

  const { count: visitCount } = await adminSupabase
    .from("loyalty_visits")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", session.customerId)
    .eq("restaurant_id", session.restaurantId);

  const { data: unredeemedReward } = await adminSupabase
    .from("loyalty_rewards")
    .select("id, created_at")
    .eq("customer_id", session.customerId)
    .eq("restaurant_id", session.restaurantId)
    .eq("is_redeemed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    visitCount: visitCount ?? 0,
    streakProgress: (visitCount ?? 0) % streakTarget,
    streakTarget,
    hasReward: !!unredeemedReward,
    rewardId: unredeemedReward?.id ?? null,
  });
}
