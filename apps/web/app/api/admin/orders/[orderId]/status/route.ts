import { rateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { VALID_TRANSITIONS } from "@quickr/shared";
import { z } from "zod";

const UpdateStatusSchema = z.object({
  status: z.enum([
    "pending",
    "accepted",
    "preparing",
    "ready",
    "served",
    "paid",
    "cancelled",
  ]),
});

export async function PATCH(
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

  const body = await req.json();
  const parsed = UpdateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
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
    .select("id, status, restaurant_id, customer_id")
    .eq("id", params.orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.restaurant_id !== member.restaurant_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(parsed.data.status)) {
    return NextResponse.json(
      {
        error: `Cannot transition from "${order.status}" to "${parsed.data.status}".`,
        allowed,
      },
      { status: 409 }
    );
  }

  const { error } = await adminSupabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", params.orderId)
    .eq("restaurant_id", member.restaurant_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (parsed.data.status === "served" || parsed.data.status === "paid") {
    const visitDate = new Date().toISOString().slice(0, 10);
    const { error: visitError } = await adminSupabase.from("loyalty_visits").insert({
      customer_id: order.customer_id,
      restaurant_id: order.restaurant_id,
      order_id: params.orderId,
      visit_date: visitDate,
    });

    if (visitError && !visitError.message.includes("duplicate")) {
      return NextResponse.json({ error: visitError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, status: parsed.data.status });
}
