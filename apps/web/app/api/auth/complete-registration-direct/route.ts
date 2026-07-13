import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  // User must already be logged in (Supabase just created their session)
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { cafe_name, owner_name, mobile, slug } = await req.json();

  if (!cafe_name || !slug) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  // Check if already onboarded
  const { data: existing } = await adminSupabase
    .from("tenant_members")
    .select("restaurant_id, restaurants(slug)")
    .eq("user_id", session.user.id)
    .single();

  if (existing) {
    return NextResponse.json({
      slug: (existing.restaurants as any).slug,
    });
  }

  // Create restaurant + link owner
  const { data: result, error } = await adminSupabase.rpc(
    "create_restaurant_and_owner",
    {
      p_user_id:       session.user.id,
      p_cafe_name:     cafe_name,
      p_slug:          slug,
      p_owner_name:    owner_name ?? "",
      p_mobile:        mobile ?? "",
      p_primary_color: "#630102",
    }
  );

  if (error || !result?.length) {
    console.error("[Registration Direct]", error);
    return NextResponse.json({ error: "Failed to create restaurant." }, { status: 500 });
  }

  return NextResponse.json({ slug: result[0].slug });
}
