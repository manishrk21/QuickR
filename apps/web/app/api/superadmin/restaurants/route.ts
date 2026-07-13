// apps/web/app/api/superadmin/restaurants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

async function verifySuperadmin(req: NextRequest) {
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

export async function GET(req: NextRequest) {
  const session = await verifySuperadmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await adminSupabase
    .rpc("get_all_restaurants_for_superadmin");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ restaurants: data ?? [] });
}
