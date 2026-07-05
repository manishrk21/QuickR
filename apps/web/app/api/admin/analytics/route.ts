export const dynamic = "force-dynamic";
import { rateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const days = Math.min(
    90,
    Math.max(7, Number(req.nextUrl.searchParams.get("days") ?? 30))
  );

  const { data: member } = await supabase
    .from("tenant_members")
    .select("restaurant_id")
    .eq("user_id", session.user.id)
    .single();

  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurantId = member.restaurant_id;

  const [daily, topItems, peakHours, summary] = await Promise.all([
    supabase.rpc("get_daily_revenue",      { p_restaurant_id: restaurantId, p_days: days }),
    supabase.rpc("get_top_items",          { p_restaurant_id: restaurantId, p_days: days }),
    supabase.rpc("get_peak_hours",         { p_restaurant_id: restaurantId, p_days: days }),
    supabase.rpc("get_analytics_summary",  { p_restaurant_id: restaurantId, p_days: days }),
  ]);

  return NextResponse.json({
    daily:     daily.data     ?? [],
    topItems:  topItems.data  ?? [],
    peakHours: peakHours.data ?? [],
    summary:   summary.data?.[0] ?? null,
    days,
  });
}
