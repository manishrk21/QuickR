import { rateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { customerId: string; rewardId: string } }
) {
    const limited = await rateLimit(req, "admin");
    if (limited) return limited;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("tenant_members")
    .select("restaurant_id")
    .eq("user_id", session.user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: reward } = await supabase
    .from("loyalty_rewards")
    .select("id, is_redeemed, customer_id, restaurant_id")
    .eq("id", params.rewardId)
    .eq("customer_id", params.customerId)
    .eq("restaurant_id", member.restaurant_id)
    .single();

  if (!reward) {
    return NextResponse.json({ error: "Reward not found." }, { status: 404 });
  }

  if (reward.is_redeemed) {
    return NextResponse.json({ error: "Already redeemed." }, { status: 409 });
  }

  const { error } = await supabase
    .from("loyalty_rewards")
    .update({ is_redeemed: true, redeemed_at: new Date().toISOString() })
    .eq("id", params.rewardId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
