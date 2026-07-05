import { rateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateItemStatusSchema = z.object({
  item_status: z.enum(["pending", "preparing", "done"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string; itemId: string } }
) {
  const limited = await rateLimit(req, "admin");
  if (limited) return limited;
  
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = UpdateItemStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: item } = await supabase
    .from("order_items")
    .select("id, order_id")
    .eq("id", params.itemId)
    .eq("order_id", params.orderId)
    .single();

  if (!item) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  const { error } = await supabase
    .from("order_items")
    .update({ item_status: parsed.data.item_status })
    .eq("id", params.itemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
