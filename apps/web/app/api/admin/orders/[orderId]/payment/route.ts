import { rateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const PaymentSchema = z.object({
  payment_method: z.enum(["cash", "upi", "card", "other"]),
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
  const parsed = PaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", params.orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Order must be marked paid before setting payment method." },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("orders")
    .update({
      payment_method: parsed.data.payment_method,
      payment_status: "paid",
    })
    .eq("id", params.orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
