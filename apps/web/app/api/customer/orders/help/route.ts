import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { getCustomerSession, TABLE_COOKIE } from "@/lib/auth/customer-session";

const HELP_TEXT = "Need help";

export async function POST(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const cookieTableId = req.cookies.get(TABLE_COOKIE)?.value ?? null;
  const resolvedTableId = session.tableId ?? cookieTableId;

  if (!resolvedTableId) {
    return NextResponse.json(
      { error: "No table selected. Please refresh the page and try again." },
      { status: 400 }
    );
  }

  const { data: table } = await adminSupabase
    .from("tables")
    .select("id, restaurant_id, is_active")
    .eq("id", resolvedTableId)
    .eq("restaurant_id", session.restaurantId)
    .single();

  if (!table || !table.is_active) {
    return NextResponse.json({ error: "Invalid or inactive table." }, { status: 400 });
  }

  const { data: existingOrder } = await adminSupabase
    .from("orders")
    .select("id, special_instructions, status")
    .eq("restaurant_id", session.restaurantId)
    .eq("table_id", resolvedTableId)
    .in("status", ["pending", "accepted", "preparing", "ready", "served"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingOrder) {
    const currentInstructions = existingOrder.special_instructions?.trim() ?? "";
    const alreadyHasHelp = currentInstructions.toLowerCase().includes(HELP_TEXT.toLowerCase());

    if (alreadyHasHelp) {
      return NextResponse.json({ message: "A waiter has already been alerted." });
    }

    const updatedInstructions = currentInstructions
      ? `${currentInstructions} • ${HELP_TEXT}`
      : HELP_TEXT;

    const { error: updateError } = await adminSupabase
      .from("orders")
      .update({ special_instructions: updatedInstructions })
      .eq("id", existingOrder.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to send help request." }, { status: 500 });
    }

    return NextResponse.json({ order_id: existingOrder.id, message: "Help request sent." });
  }

  const { data: helpOrder, error: insertError } = await adminSupabase
    .from("orders")
    .insert({
      restaurant_id: session.restaurantId,
      customer_id: session.customerId,
      table_id: resolvedTableId,
      status: "pending",
      payment_status: "unpaid",
      total_amount: 0,
      special_instructions: HELP_TEXT,
    })
    .select("id")
    .single();

  if (insertError || !helpOrder) {
    return NextResponse.json({ error: "Failed to send help request." }, { status: 500 });
  }

  return NextResponse.json({ order_id: helpOrder.id, message: "Help request sent." });
}
