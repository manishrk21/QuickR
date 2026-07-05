import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { MenuItemSchema } from "@quickr/shared";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const isAvailableBoolean = body.status === "available";

  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailableBoolean })
    .eq("id", params.itemId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
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

  const { error } = await supabase
    .from("menu_items")
    .update({
      ...parsed.data,
      image_url: body.image_url // Force map update raw URL directly
    })
    .eq("id", params.itemId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("menu_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", params.itemId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
