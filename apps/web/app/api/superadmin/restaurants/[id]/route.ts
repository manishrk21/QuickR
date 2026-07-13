// apps/web/app/api/superadmin/restaurants/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

async function verifySuperadmin() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data } = await supabase
    .from("superadmins")
    .select("user_id")
    .eq("user_id", session.user.id)
    .single();
  return data ? session : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await verifySuperadmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [detail, recentOrders] = await Promise.all([
    adminSupabase.rpc("get_restaurant_detail_for_superadmin", {
      p_restaurant_id: params.id,
    }),
    adminSupabase
      .from("orders")
      .select("id, status, total_amount, created_at, tables(label), customers(mobile, name)")
      .eq("restaurant_id", params.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return NextResponse.json({
    restaurant: detail.data?.[0] ?? null,
    recentOrders: recentOrders.data ?? [],
  });
}
