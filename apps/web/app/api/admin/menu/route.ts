import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { MenuItemSchema } from "@quickr/shared";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = MenuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: member } = await supabase
    .from("tenant_members")
    .select("restaurant_id")
    .eq("user_id", session.user.id)
    .single();

  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { count } = await supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("category_id", parsed.data.category_id)
    .is("deleted_at", null);

  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      ...parsed.data,
      image_url: body.image_url, // Force insert raw URL directly
      restaurant_id: member.restaurant_id,
      display_order: count ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
