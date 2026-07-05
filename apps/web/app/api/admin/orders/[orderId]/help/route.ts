import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

const HELP_TEXT = "Need help";

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .select("id, restaurant_id, special_instructions, total_amount")
    .eq("id", params.orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.restaurant_id !== member.restaurant_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const currentInstructions = order.special_instructions ?? "";
  const hasHelp = currentInstructions.toLowerCase().includes(HELP_TEXT.toLowerCase());

  if (!hasHelp) {
    return NextResponse.json({ ok: true });
  }

  const remainingInstructions = currentInstructions
    .split("•")
    .map((part: string) => part.trim())
    .filter((part: string) => part && part.toLowerCase() !== HELP_TEXT.toLowerCase())
    .join(" • ");

  const isHelpOnly = Number(order.total_amount) === 0;

  if (isHelpOnly) {
    const { error: deleteError } = await adminSupabase
      .from("orders")
      .delete()
      .eq("id", order.id)
      .eq("restaurant_id", member.restaurant_id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, dismissed: true });
  }

  const { error: updateError } = await adminSupabase
    .from("orders")
    .update({ special_instructions: remainingInstructions || null })
    .eq("id", order.id)
    .eq("restaurant_id", member.restaurant_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, dismissed: true });
}
